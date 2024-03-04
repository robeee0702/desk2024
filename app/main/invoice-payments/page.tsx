"use client";
import { database, storage } from "@/firebase";
import { useClerk } from "@clerk/nextjs";
import { get, onValue, push, ref, update } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Product {
  productName: string;
  productType: string;
  artNumber: number;
  category: string;
  subCategory: string;
  quantity: number;
  vatNumber: number;
  stockValue: number;
  purchasePrice: number;
  salesPrice: number;
  units: string;
  currency: string;
  date: string;
  lastModifiedDate: string;
}

interface Partners {
  partnerName: string;
  vatNumber: string;
  euVatNumber: string;
  groupVatNumber: string;
  postalCode: string;
  city: string;
  country: string;
  address: string;
  addressType: string;
  houseNumber: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  deliveryAddress: string;
  deliveryHouseNumber: string;
  emailAddress: string;
  phoneNumber: string;
  paymentMethod: string;
  partnerType: string;
}

interface Profile {
  companyName: string;
  vatNumber: string;
  euVatNumber: string;
  groupVatNumber: string;
  postalCode: string;
  country: string;
  city: string;
  address: string;
  addressType: string;
  houseNumber: string;
  houseFloor: string;
  houseDoor: string;
  ibanNumber: string;
  bankName: string;
  websiteURL: string;
  phoneNumber: string;
  email: string;
}

export default function Page() {
  // useClerk hozzáadása
  const { user } = useClerk();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [partners, setPartners] = useState<Partners[] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedProductValue, setSelectedProductValue] = useState<string>("");
  const [defaultCurrency, setDefaultCurrency] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partners | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurrency);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formattedTime, setFormattedTime] = useState(currentTime.toLocaleDateString() + " " + currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

  const pdfRef = useRef();

  const generatePDF = async () => {
    try {
      if (!pdfRef.current) {
        console.error("pdfRef is not defined.");
        return;
      }

      const input = pdfRef.current;

      console.log("Capturing screenshot...");
      const canvas = await html2canvas(input, { scale: 2 });

      console.log("Converting to image data...");
      const imgData = canvas.toDataURL("image/png");

      console.log("Creating PDF...");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      console.log("Saving PDF...");
      pdf.save(`${selectedProducts.map((p) => p.artNumber)}szamla.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const [isDatePickerVisible1, setIsDatePickerVisible1] = useState(false);
  const [selectedDate1, setSelectedDate1] = useState(new Date());

  const [isDatePickerVisible2, setIsDatePickerVisible2] = useState(false);
  const [selectedDate2, setSelectedDate2] = useState(new Date());

  const handleDateChange1 = (date) => {
    setSelectedDate1(date);
    setIsDatePickerVisible1(false);
  };

  const handleDateChange2 = (date) => {
    setSelectedDate2(date);
    setIsDatePickerVisible2(false);
  };

  const handleParagraphClick1 = () => {
    setIsDatePickerVisible1(true);
  };

  const handleParagraphClick2 = () => {
    setIsDatePickerVisible2(true);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
      setFormattedTime(currentTime.toLocaleDateString());
    }, 10000);

    return () => clearInterval(intervalId);
  }, [currentTime]);

  const [exchangeRates, setExchangeRates] = useState({});

  const fetchExchangeRates = (baseCurrency) => {
    const apiKey = "44c59042e511d7260de7b563b880daa0";
    const apiUrl = `https://open.er-api.com/v6/latest?apikey=${apiKey}&base=${baseCurrency}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((exchangeData) => {
        setExchangeRates(exchangeData.rates);
      })
      .catch((error) => {
        console.error("Hiba történt a valutaárfolyamok lekérése közben:", error);
      });
  };

  const [isInvoiceFinalized, setIsInvoiceFinalized] = useState(false);

  // ...

  const handleFinalizeInvoice = () => {
    // Frissítsd a selectedProducts helyi állapotát az aktuális mennyiségekkel
    const updatedSelectedProducts = selectedProducts.map((product) => ({
      ...product,
      quantity: product.quantity,
    }));

    // Mentsd az adatbázisba
    updatedSelectedProducts.forEach(async (product) => {
      await updateQuantityInDatabase(product, product.quantity);
    });

    // Állítsa be a véglegesített állapotot
    setIsInvoiceFinalized(true);
  };

  const handleQuantityChange = (newQuantity, index) => {
    // Frissítsd a selectedProducts helyi állapotát az aktuális mennyiségekkel
    const updatedSelectedProducts = [...selectedProducts];
    updatedSelectedProducts[index].quantity = newQuantity;
    setSelectedProducts(updatedSelectedProducts);

    // Számolja újra a teljes összeget
    const { totalNetPrice, totalVat, totalGrossPrice } = calculateTotalValues();

    // Állítsa be a véglegesített állapotot
    setIsInvoiceFinalized(false); // Állítsa vissza, mivel még nem véglegesítettük
  };

  // Összes termék lekérése
  useEffect(() => {
    if (user) {
      const allProductsRef = ref(database, `/users/data/${user.id}/categories`);

      onValue(allProductsRef, (snapshot) => {
        const categoriesData = snapshot.val();
        if (categoriesData) {
          const allProductsArray: Product[] = [];
          let defaultCurrency = ""; // Alapértelmezett deviza inicializálása

          Object.entries(categoriesData).forEach(([category, subCategories]) => {
            Object.entries(subCategories).forEach(([subCategory, products]) => {
              Object.entries(products).forEach(([productId, product]: [string, Product]) => {
                if (!product.hasOwnProperty("quantity")) {
                  product.quantity = 1;
                }
                if (product.currency) {
                  defaultCurrency = product.currency;
                }
                allProductsArray.push({
                  ...product,
                  category: category,
                  subCategory: subCategory,
                });
              });
            });
          });

          setProducts(allProductsArray);
          setSelectedProductValue("");
        }
      });
    }
  }, [user]);

  // Partnerek lekérése
  useEffect(() => {
    if (user) {
      const allPartnersRef = ref(database, `/users/data/${user.id}/partners`);

      onValue(allPartnersRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          const partnersArray: Partners[] = [];
          Object.entries(data).forEach(([productId, partner]: [string, Partners]) => {
            partnersArray.push({
              ...partner,
            });
          });

          setPartners(partnersArray);
        }
      });
    }
  }, [user]);

  // My-profile lekérése
  useEffect(() => {
    if (user) {
      const myProfilRef = ref(database, `/users/data/${user.id}/my-profile`);

      onValue(myProfilRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          setProfile(data);
        }
      });
    }
  }, [user]);

  const updateQuantityInDatabase = async (myProduct, newQuantity) => {
    try {
      const { category, subCategory, artNumber } = myProduct;
      const productRef = ref(database, `/users/data/${user.id}/categories/${category}/${subCategory}/${artNumber}`);
      const snapshot = await get(productRef);
      const productData = snapshot.val();

      if (productData && productData.hasOwnProperty("quantity")) {
        const currentQuantity = productData.quantity;

        if (newQuantity <= currentQuantity) {
          const updatedQuantity = currentQuantity - newQuantity;

          await update(productRef, { quantity: updatedQuantity });

          const updatedSelectedProducts = selectedProducts.map((product) => {
            if (product.artNumber === myProduct.artNumber) {
              return { ...product, quantity: newQuantity };
            }
            return product;
          });

          setSelectedProducts(updatedSelectedProducts);
        } else {
          console.error("Nincs elég raktáron a kiválasztott mennyiség.");
        }
      } else {
        console.error("A termék nem rendelkezik quantity tulajdonsággal.");
      }
    } catch (error) {
      console.error("Hiba történt a mennyiség módosítása során:", error);
    }
  };

  useEffect(() => {
    if (selectedProducts.length > 0) {
      setDefaultCurrency(selectedProducts[0].currency);
    }
  }, [selectedProducts]);

  // console.log(defaultCurrency);

  useEffect(() => {
    setExchangeRates((prevRates) => {
      const baseRate = prevRates[defaultCurrency];
      const newRates = { ...prevRates };

      Object.keys(newRates).forEach((currency) => {
        newRates[currency] /= baseRate;
      });

      return newRates;
    });

    fetchExchangeRates(defaultCurrency);
  }, [defaultCurrency]);

  const handleProductSelect = (e) => {
    const selectedArtNumber = e.target.value;
    if (selectedArtNumber) {
      const selectedProduct = products.find((product) => product.artNumber === JSON.parse(selectedArtNumber).artNumber);

      const isAlreadySelected = selectedProducts.some((product) => product.artNumber === selectedProduct.artNumber);

      if (!isAlreadySelected) {
        setSelectedProducts([...selectedProducts, { ...selectedProduct, quantity: 1 }]);
        setExchangeRates((prevRates) => ({
          ...prevRates,
          [selectedProduct.currency]: 1 / selectedProduct.salesPrice,
        }));
      }
    }
  };

  const handlePartnerSelect = (e) => {
    const selectedPartnerName = e.target.value;
    const partner = partners.find((p) => p.partnerName === selectedPartnerName);
    setSelectedPartner(partner);
  };

  const removeSelectedProduct = (index) => {
    const updatedSelectedProducts = [...selectedProducts];
    updatedSelectedProducts.splice(index, 1);
    setSelectedProducts(updatedSelectedProducts);
  };

  const calculateTotalValues = () => {
    let totalNetPrice = 0;
    let totalVat = 0;
    let totalGrossPrice = 0;

    selectedProducts.forEach((selectedProduct) => {
      const netPrice = selectedProduct.quantity * selectedProduct.salesPrice;
      const vatRate = selectedProduct.vatNumber / 100;
      const vat = netPrice * vatRate;
      const total = netPrice + vat;

      totalNetPrice += netPrice;
      totalVat += vat;
      totalGrossPrice += total;
    });

    return {
      totalNetPrice,
      totalVat,
      totalGrossPrice,
    };
  };

  const { totalNetPrice, totalVat, totalGrossPrice } = calculateTotalValues();

  const handleCurrencySelect = (e) => {
    const selectedCurrency = e.target.value;
    setSelectedCurrency(selectedCurrency);
  };

  const [image, setImage] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  const handleFileUpload = async () => {
    if (!image) {
      return;
    }

    try {
      const fileName = image.name;
      const fileRef = storageRef(storage, `${user.id}/${fileName}`);
      const snapshot = await uploadBytes(fileRef, image);

      console.log("Fájl sikeresen feltöltve:", snapshot);

      const imageUrl = await getDownloadURL(fileRef);
      saveImageUrlToDatabase(imageUrl);
    } catch (error) {
      console.error("Hiba a fájl feltöltésekor:", error);
    }
  };

  const saveImageUrlToDatabase = (imageUrl) => {
    // Példa a kép URL-jének mentésére a felhasználó adatbázisába
    // Az adatbázis struktúráját az alkalmazásodnak megfelelően kell módosítani
    // Ebben az esetben feltételezzük, hogy a felhasználónak van egy "images" nevű kollekciója
    const userImagesRef = ref(database, `users/${user.id}/images`);

    // A kép URL-jének hozzáadása a kollekcióhoz
    push(userImagesRef, imageUrl);
  };

 

  return (
    <div>
      <div>
        {/* Termékekhez legördülő menü */}
        <select onChange={handleProductSelect} value={selectedProductValue}>
          <option value="">Válassz terméket</option>
          {products &&
            products.map((product, index) => (
              <option key={index} value={JSON.stringify(product)}>
                {product.productName}
              </option>
            ))}
        </select>
        <select onChange={handlePartnerSelect} value={selectedPartner?.partnerName || ""}>
          <option value="">Válassz partnert</option>
          {partners &&
            partners.map((partner, index) => (
              <option key={index} value={partner.partnerName}>
                {partner.partnerName}
              </option>
            ))}
        </select>
      </div>
      <div ref={pdfRef} className="max-w-4xl mx-auto my-8 p-8 border-2 border-black rounded-lg">
        <div className="mb-12"></div>
        <h1 className="flex justify-center border-t border-b border-black p-3 text-black72 font-bold text-3xl  leading-10 mb-8">SZÁMLA</h1>
        <div>
          {!image && <input type="file" onChange={handleFileChange} />}
          {!image && <button onClick={handleFileUpload}>Kép feltöltése</button>}
          {image && <img src={URL.createObjectURL(image)} alt="Kiválasztott kép" className=" m-2 w-40 cursor-pointer" />}
        </div>
        <div className="flex justify-between mt-10 mb-12">
          {/* Bal oldal */}
          <div className="text-left">
            <h1 className="font-bold text-xl -mt-5">Issuer data:</h1>
            <div id="company" className="mt-4 whitespace-nowrap">
              <div>{profile?.companyName}</div>
              <div className="text-sm mt-2">{profile?.country}</div>
              <div className="flex text-sm">
                {profile?.postalCode} {profile?.city}, {profile?.address} {profile?.addressType} {profile?.houseNumber}.
              </div>
              <div className=" flex text-sm ">
                VAT: <p className="mx-2">{profile?.vatNumber}</p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center text-black ">
                  <MdEmail size={21} /> <p className="mx-2">{`${profile?.email || ""}`}</p>
                </div>
                <div className="flex items-center text-black">
                  <FaPhone size={18} /> <p className="mx-2">{`${profile?.phoneNumber || ""}`}</p>
                </div>
                <div className="flex items-center text-black">
                  <TbWorldWww size={18} /> <p className="mx-2">{`${profile?.websiteURL || ""}`}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobb oldal */}
          <div className="text-right">
            <h1 className="font-bold text-xl -mt-5">Customer data:</h1>
            <div id="customer" className="mt-4 whitespace-nowrap">
              <div className="flex">
                <span className="text-blue">Name:</span> <p className="mx-2">{`${selectedPartner?.partnerName || ""}`}</p>
              </div>
              <div className="flex">
                <span className="text-blue">Address:</span>{" "}
                <p className="mx-2">
                  {`${selectedPartner?.postalCode || ""}`} {`${selectedPartner?.city || ""}`}, {`${selectedPartner?.address || ""}`} {`${selectedPartner?.addressType || ""}`} {`${selectedPartner?.houseNumber || ""}.`}
                </p>
              </div>
              <div className="flex">
                <span className="text-blue">Email:</span>{" "}
                <a href={`mailto:${selectedPartner?.emailAddress}`}>
                  <p className="mx-2">{`${selectedPartner?.emailAddress || ""}`}</p>
                </a>
              </div>
              <div className="flex">
                <span className="text-blue">VAT Number:</span> <p className="mx-2">{`${selectedPartner?.vatNumber || ""}`}</p>
              </div>
              <div className="flex">
                <span className="text-blue"> Group VAT Number:</span> <p className="mx-2">{`${selectedPartner?.groupVatNumber || ""}`}</p>
              </div>
              <div className="flex mt-4">
                {selectedPartner?.deliveryPostalCode && (
                  <div>
                    <span className="text-blue">Delivery address:</span>
                    <p className="mx-2">
                      {`${selectedPartner?.deliveryPostalCode} `}
                      {`${selectedPartner?.deliveryCity || ""}, `}
                      {`${selectedPartner?.deliveryAddress || ""} `}
                      {`${selectedPartner?.addressType || ""} `}
                      {`${selectedPartner?.deliveryHouseNumber || ""}.`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Választó vonal */}
        <div className="border-b border-black divide-x divide-black my-4"></div>
        {/* Információs tábla */}
        {selectedProducts.length > 0 && (
          <table className="border-collapse w-full text-sm">
            <tbody>
              <tr>
                {/* <td className="h-16 bg-grey border border-black align-top">Információ:</td> */}
                <td className="h-16 bg-grey border border-black align-top text-center">
                  <div className="flex flex-col items-center h-full">
                    <span>Számla kelte:</span>
                    <p className="font-bold">{formattedTime}</p>
                  </div>
                </td>
                <td className="h-16 bg-grey border border-black align-top text-center">
                  <div className="flex flex-col items-center h-full">
                    <span>Teljesítás napja:</span>
                    {isDatePickerVisible2 ? (
                      <DatePicker selected={selectedDate2} onChange={handleDateChange2} dateFormat="yyyy-MM-dd" placeholderText="Select a date" />
                    ) : (
                      <p className="font-bold" onClick={handleParagraphClick2}>
                        {selectedDate2.toISOString().slice(0, 10)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="h-16 bg-grey border border-black align-top text-center">
                  <div className="flex flex-col items-center h-full">
                    <span>Fizetési határidő:</span>
                    {isDatePickerVisible1 ? (
                      <DatePicker selected={selectedDate1} onChange={handleDateChange1} dateFormat="yyyy-MM-dd" placeholderText="Select a date" />
                    ) : (
                      <p className="font-bold" onClick={handleParagraphClick1}>
                        {selectedDate1.toISOString().slice(0, 10)}
                      </p>
                    )}
                  </div>
                </td>

                <td className="h-16 bg-grey border border-black align-top text-center">
                  <div className="flex flex-col items-center h-full">
                    <span>Fizetés módja:</span>
                
                    <select>
                      <option>Készpénz</option>
                      <option>Utalás</option>
                    </select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
        <div className="m-1">
          <h2 className="m-2">Megjegyzés:</h2>
          <textarea className="flex w-full border"></textarea>
        </div>
        {/* Termék Táblázat */}
        {selectedProducts.length > 0 && (
          <table className="border-collapse w-full text-sm mt-4">
            <thead>
              <tr>
                <th className="py-2 px-1 border text-left">Art number</th>
                <th className="py-2 px-1 border text-left">Product name</th>
                <th className="py-2 px-1 border text-left">Quantity</th>
                <th className="py-2 px-1 border text-left">Unit Price</th>
                <th className="py-2 px-1 border text-left">Net Price</th>
                <th className="py-2 px-2 border text-left">VAT</th>
                <th className="py-2 px-1 border text-center">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {selectedProducts.map((selectedProduct, index) => (
                <tr key={index}>
                  <td className="py-2 px-1 text-center">{selectedProduct.artNumber || "N/A"}</td>
                  <td className="py-2 px-1 text-center">{selectedProduct.productName || "N/A"}</td>

                  <td className="py-2 px-1 text-center w-10">
                    <input
                      type="number"
                      className="w-16 border"
                      value={selectedProduct.quantity}
                      onChange={(e) => {
                        handleQuantityChange(parseInt(e.target.value, 10), index);
                      }}
                      key={index}
                    />
                  </td>

                  <td className="py-2 px-1 text-center">
                    {(selectedProduct.salesPrice * exchangeRates[selectedCurrency || defaultCurrency]).toFixed(2)} {selectedCurrency || defaultCurrency}
                  </td>
                  <td className="py-2 px-1 text-center">
                    {" "}
                    {(selectedProduct.quantity * selectedProduct.salesPrice * exchangeRates[selectedCurrency || defaultCurrency]).toFixed(2)} {selectedCurrency || defaultCurrency}
                  </td>
                  <td className="py-2 px-1 text-center">{selectedProduct.vatNumber || "N/A"}%</td>
                  <td className="py-2 px-1 text-center">
                    <div className="flex justify-end">
                      <span>
                        {((selectedProduct.quantity * selectedProduct.salesPrice * (1 + selectedProduct.vatNumber / 100) || 0) * exchangeRates[selectedCurrency || defaultCurrency]).toFixed(2)}{" "}
                        {selectedCurrency || defaultCurrency}
                      </span>

                      <button className="text-2xl ml-3" onClick={() => removeSelectedProduct(index)}>
                        <MdDeleteForever />
                      </button>
                    </div>
                  </td>
                  {/* Add other columns as needed */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <table className="border-collapse w-full text-sm">
          <tbody>
            {/*Infos táblázat */}
            <tr>
              <td className="w-96 bg-grey border border-black align-top">A számla megfelel a 23/2014 . (VI.30) NGM rendeletnek.</td>
              <td className="w-60 bg-grey border border-black align-top text-center">
                <div className="flex flex-col items-center h-full">
                  <span>Áfa típus</span>
                </div>
              </td>
              <td className="w-60 bg-grey border border-black align-top text-center">
                <div className="flex flex-col items-center h-full">
                  <span>ÁFA</span>
                </div>
              </td>
              <td className="w-60 bg-grey border border-black align-top text-center">
                <div className="flex flex-col items-center h-full">
                  <span>Nettó</span>
                </div>
              </td>
              <td className="w-60 bg-grey border border-black align-top text-center">
                <div className="flex flex-col items-center h-full">
                  <span>Bruttó</span>
                </div>
              </td>
            </tr>
            {/* Érték táblázat */}

            <tr>
              <td className="w-80 h-8 my-auto pb-1 bg-grey border border-black align-top"></td>
              <td className="w-60 bg-grey border border-black align-center text-center">
                <div className="flex flex-col items-center h-full">
                  <span>{selectedProducts.map((product) => product.vatNumber).join(", ")}</span>
                </div>
              </td>
              <td className="w-60 bg-grey border border-black align-center text-center">
                <div className="flex flex-col items-center h-full">
                  <span>{(totalVat * exchangeRates[selectedCurrency || defaultCurrency]).toFixed(2)}</span>
                </div>
              </td>
              <td className="w-60 bg-grey border border-black align-center text-center">
                <div className="flex flex-col items-center h-full">
                  <span>{(totalNetPrice * exchangeRates[selectedCurrency || defaultCurrency]).toFixed(2)}</span>
                </div>
              </td>
              <td className="w-72 bg-grey border border-black align-center text-center">
                <div className="flex flex-col items-center h-full">
                  <span>
                    {(totalGrossPrice * exchangeRates[selectedCurrency || defaultCurrency]).toFixed(2)} {selectedCurrency || defaultCurrency}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="h-14 pb-2 bg-grey border border-black">
                <div className="h-full flex items-end justify-end ">
                  <span className="mr-10 font-bold">Teljes fizetendő összeg:</span>
                  <span className="mr-12">
                    {(totalGrossPrice * exchangeRates[selectedCurrency || defaultCurrency]).toFixed(2)} {selectedCurrency || defaultCurrency}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={5} className="h-12 pb-3 bg-grey border border-black">
                <div className="h-full flex items-end justify-end">
                  <span className="mr-10 font-bold">Valuta:</span>
                  <select onChange={handleCurrencySelect} value={selectedCurrency}>
                    {/* Itt hozzáadhatsz további valutákat az exchangeRates állapothoz */}
                    {Object.keys(exchangeRates).map((currency, index) => (
                      <option key={index} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="mt-24"></div>
        {selectedProducts.length > 0 && (
          <div>
            <button className="bg-blue hover:bg-blue text-black font-bold py-2 mx-4 cursor-pointer px-4 rounded" onClick={handleFinalizeInvoice} disabled={isInvoiceFinalized}>
              Véglegesítés
            </button>
            <button className="bg-blue hover:bg-blue text-black font-bold py-2 cursor-pointer px-4 rounded" onClick={generatePDF} disabled={!isInvoiceFinalized}>
              PDF Létrehozása
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
