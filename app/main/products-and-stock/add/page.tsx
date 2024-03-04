"use client";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { get, ref, set } from "firebase/database";
import { database } from "@/firebase";
import { useRouter } from "next/navigation";
import { getLanguage } from "@/app/constants/index";

const translations = {
  en: {
    addNewProduct: "ADD NEW PRODUCT",
    category: "Category",
    subCategory: "Sub category(e.g. Manufactur..)",
    productName: "Product name",
    productType: "Product type",
    quantity: "Quantity",
    purchasePrice: "Purchase Price",
    artNumber: "Art number",
    date: "Creation Date",
    vatNumber: "VAT %",
    units: "Units (pc/kg/meter/etc..)",
    salesPrice: "Sales Price",
    currency: "Currency",
    stockValue: "Stock Value",
    save: "Save",
  },
  de: {
    addNewProduct: "NEUES PRODUKT HINZUFÜGEN",
    category: "Kategorie",
    subCategory: "Unterkategorie(zB. Hersteller..)",
    productName: "Produkt name",
    productType: "Produkt typ",
    date: "Erstellungsdatum",
    quantity: "Menge",
    purchasePrice: "Einkaufspreis",
    artNumber: "Artikelnummer",
    units: "Einheiten (Stk/kg/meter/etc..)",
    vatNumber: "Steuer %",
    salesPrice: "Verkaufspreis",
    stockValue: "Bestand Wert",
    currency: "Währung",
    save: "Speichern",
  },
  hu: {
    addNewProduct: "ÚJ TERMÉK HOZZÁADÁSA",
    category: "Kategória",
    subCategory: "Alkategória(Pl. Gyártó..)",
    date: "Létrehozás dátuma",
    productName: "Termék neve",
    productType: "Termék típusa",
    quantity: "Mennyiség",
    purchasePrice: "Beszerzési ár",
    vatNumber: "ÁFA %",
    artNumber: "Cikkszám",
    stockValue: "Készlet érték",
    currency: "Valuta",
    units: "Egység(Stk/kg/meter/etc..)",
    salesPrice: "Eladási ár",
    save: "Mentés",
  },
};

export default function Page() {
  const { user } = useClerk();
  const router = useRouter();
  const [language, setLanguage] = useState<string>("en"); //Alapértelmezett angol
  const translation = translations[language];
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formattedTime, setFormattedTime] = useState(
    currentTime.toLocaleDateString() +
      " " +
      currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const [categoryData, setCategoryData] = useState({ category: "" });
  const [subCategoryData, setSubCategoryData] = useState({ subCategory: "" });
  const [productData, setProductData] = useState({
    productName: "",
    productType: "",
    quantity: 0,
    purchasePrice: 0.0,
    artNumber: 0,
    units: "",
    vatNumber: 0,
    salesPrice: 0.0,
    stockValue: 0.0,
    currency: "EUR",
    date: currentTime,
  });

  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
      setFormattedTime(
        currentTime.toLocaleDateString() +
        " " +
        currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        );
      }, 10000);
      
      return () => clearInterval(intervalId);
    }, [currentTime]);
    
    useEffect(() => {
      const clientLanguage = getLanguage();
      setLanguage(clientLanguage);
    }, []);
    
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 2200);
      
      return () => clearTimeout(loadingTimeout);
    }, []);


    const [exchangeRates, setExchangeRates] = useState({});
    
    useEffect(() => {
      const apiKey = "44c59042e511d7260de7b563b880daa0";
    const apiUrl = `https://open.er-api.com/v6/latest?apikey=${apiKey}`;

    fetch(apiUrl)
      .then((response) => response.json())
      .then((exchangeData) => {
        // A válasz tartalmazza a valutaárfolyamokat
        setExchangeRates(exchangeData.rates);
      })
      .catch((error) => {
        console.error(
          "Hiba történt a valutaárfolyamok lekérése közben:",
          error
        );
      });
  }, []);

  
  const handleCategoryChange = (e) => {
    const { id, value } = e.target;
    setCategoryData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handlesubCategoryChange = (e) => {
    const { id, value } = e.target;
    setSubCategoryData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleProductChange = (e) => {
    const { id, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleAddToData = async () => {
    if (
      !user ||
      !user.id ||
      !categoryData.category ||
      !subCategoryData.subCategory ||
      !productData.productName ||
      !productData.artNumber ||
      !productData.date
    ) {
      // Browser text
      let message = "";
      switch (language) {
        case "hu":
          message = "Kérlek töltsd ki az összes kötelező mezőt.";
          break;
        case "de":
          message = "Bitte fülle alle Pflichtfelder aus.";
          break;
        default:
          message = "Please fill out all required fields.";
      }

      window.alert(message);
      return;
    }
    // Referencia útvonal category
    const categoriesRef = ref(database, `users/data/${user.id}/categories`);

    // Ellenőrizzük, hogy a kategória már létezik-e
    const categorySnapshot = await get(categoriesRef);
    if (!categorySnapshot.exists()) {
      // Ha nem létezik, hozzuk létre
      set(categoriesRef, {
        [categoryData.category]: true,
      });
    }

    //Referencia útvonal subCategoryhez
    const subCategoriesRef = ref(
      database,
      `users/data/${user.id}/categories/${categoryData.category}`
    );

    // Ellenőrizzük, hogy a kategória már létezik-e
    const subCategorySnapshot = await get(categoriesRef);
    if (!subCategorySnapshot.exists()) {
      // Ha nem létezik, hozzuk létre
      set(subCategoriesRef, {
        [subCategoryData.subCategory]: true,
      });
    }

    // Referencia útvonal product
    const productsRef = ref(
      database,
      `users/data/${user.id}/categories/${categoryData.category}/${subCategoryData.subCategory}/${productData.artNumber}`
    );

    // Az adatok frissítése a referenciában
    await set(productsRef, {
      productName: productData.productName,
      productType: productData.productType,
      artNumber: productData.artNumber,
      quantity: productData.quantity,
      purchasePrice: productData.purchasePrice,
      salesPrice: productData.salesPrice,
      units: productData.units,
      vatNumber: productData.vatNumber,
      stockValue: productData.purchasePrice * productData.quantity,
      currency: productData.currency,
      date: formattedTime,
    });

    router.push("/main/products-and-stock/list");
    window.location.reload();
  };

  return (
    <div className="w-full text-black m-3 md:m-8">
      {isLoading && (
        <div className="">
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full border-t-4 border-blue-500 border-solid h-16 w-16 mb-4"></div>
            <p className="text-2xl font-semibold animate-pulse">Loading...</p>
          </div>
        </div>
      )}
      {!isLoading && (
        <section className="">
          <div className="w-full mx-auto p-2 lg:p-12 bg-white text-darkgrey rounded-md shadow-md">
            <h1 className="flex justify-center text-black72 font-bold text-2xl mb-10">
              {translation.addNewProduct}
            </h1>
            <div className="grid grid-cols-1">
              <label
                htmlFor="category"
                className="block text-lg font-bold text-black56"
              >
                {translation.category}
              </label>
              <input
                type="text"
                id="category"
                className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                placeholder={translation.category}
                value={categoryData.category}
                onChange={handleCategoryChange}
              />
            </div>
            {/* <h1 className="text-2xl mb-4 text-black">{translation.subCategory}</h1> */}
            <div className="grid grid-cols-1">
              <label
                htmlFor="subCategory"
                className="block text-lg font-bold text-black56"
              >
                {translation.subCategory}
              </label>
              <input
                type="text"
                id="subCategory"
                className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                placeholder={translation.subCategory}
                value={subCategoryData.subCategory}
                onChange={handlesubCategoryChange}
              />
            </div>
            {/* Táblázat */}
            {/* <h1 className="text-4xl my-4 font-bold text-black">{translation.productName}</h1> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="artNumber"
                  className="block text-lg font-bold  text-black56"
                >
                  {translation.artNumber}
                </label>
                <input
                  type="number"
                  id="artNumber"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.artNumber}
                  value={productData.artNumber}
                  onChange={handleProductChange}
                />
                <label
                  htmlFor="productName"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.productName}
                </label>
                <input
                  type="text"
                  id="productName"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.productName}
                  value={productData.productName}
                  onChange={handleProductChange}
                />
                <label
                  htmlFor="productType"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.productType}
                </label>
                <input
                  type="text"
                  id="productType"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.productType}
                  value={productData.productType}
                  onChange={handleProductChange}
                />
              </div>
              {/* 2.Táblázat */}
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-lg font-bold  text-black56"
                >
                  {translation.quantity}
                </label>
                <input
                  type="number"
                  id="quantity"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.quantity}
                  value={productData.quantity}
                  onChange={handleProductChange}
                />
                <label
                  htmlFor="units"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.units}
                </label>
                <input
                  type="text"
                  id="units"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.units}
                  value={productData.units}
                  onChange={handleProductChange}
                />
                <label
                  htmlFor="purchasePrice"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.purchasePrice}
                </label>
                <input
                  type="number"
                  id="purchasePrice"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.purchasePrice}
                  value={productData.purchasePrice}
                  onChange={handleProductChange}
                />
                <label
                  htmlFor="salesPrice"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.salesPrice}
                </label>
                <input
                  type="number"
                  id="salesPrice"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.salesPrice}
                  value={productData.salesPrice}
                  onChange={handleProductChange}
                />
              </div>
              {/* Táblázat 3. */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.date}
                </label>
                <input
                  type="text"
                  id="date"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.date}
                  value={formattedTime}
                  readOnly
                />
                <label
                  htmlFor="stockValue"
                  className="block text-lg font-bold  text-black56"
                >
                  {translation.stockValue}
                </label>
                <input
                  type="number"
                  id="stockValue"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.stockValue}
                  value={productData.purchasePrice * productData.quantity}
                  onChange={handleProductChange}
                  readOnly
                />
                <label
                  htmlFor="vatNumber"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.vatNumber}
                </label>
                <input
                  type="number"
                  id="vatNumber"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  placeholder={translation.vatNumber}
                  value={productData.vatNumber}
                  onChange={handleProductChange}
                />
                <label
                  htmlFor="currency"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.currency}
                </label>
                <select
                  id="currency"
                  className="mt-1 p-2 w-full my-3 border rounded-md text-black"
                  onChange={handleProductChange}
                  value={productData.currency}
                  placeholder={translation.currency}
                >
                  <option value="EUR">EUR</option>
                  {Object.keys(exchangeRates).map((currency, index) => (
                    <option key={index} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-center mt-4">
              <button
                type="button"
                className="bg-blue text-white p-2 lg:px-96 rounded-md hover:bg-darkgrey transition duration-300"
                onClick={handleAddToData}
              >
                {translation.save}
              </button>
            </div>
          </div>
          {/* <div className="max-w-4xl mx-auto mt-8 p-6 bg-white text-darkgrey rounded-md shadow-md"></div> */}
        </section>
      )}
    </div>
  );
}
