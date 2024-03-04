"use client";
import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { database } from "@/firebase";
import { onValue, ref, remove, set } from "firebase/database";
import { getLanguage } from "@/app/constants";

const translations = {
  en: {
    productList: "PRODUCT LIST",
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
    creationDate: "Creation date",
    lastModifiedDate: "Last modified date",
    save: "Save",
    searchByCategory: 'Search by Category',
    selectCategory: 'Please select category',
    selectsubCategory: 'Please select subcategory',
    deleteText: "Are you sure you want to delete the content?",
    delete: "Delete",
    cancel: "Cancel",
    edit: "Edit",
    search: "Search",
  },
  de: {
    productList: "PRODUKT LISTE",
    category: "Kategorie",
    subCategory: "Unterkategorie(zB. Hersteller..)",
    productName: "Produkt name",
    productType: "Produkt typ",
    date: "Erstellungsdatum",
    quantity: "Menge",
    purchasePrice: "Einkaufspreis",
    artNumber: "Artikelnummer",
    units: "Einheiten (Stk/kg/meter/usw..)",
    vatNumber: "Steuer %",
    salesPrice: "Verkaufspreis",
    stockValue: "Bestand Wert",
    currency: "Währung",
    creationDate: "Erstellungsdatum",
    lastModifiedDate: "Letzte änderung",
    save: "Speichern",
    searchByCategory: 'Suche nach Kategorie',
    selectCategory: 'Bitte wahlen Sie Kategorie',
    selectsubCategory: 'Bitte wahlen Sie Unterkategorie',
    deleteText: "Sind Sie sicher, dass Sie den Inhalt löschen möchten?",
    delete: "Löschen",
    cancel: "Abbrechen",
    edit: "Bearbeiten",
    search: "Suchen",
  },
  hu: {
    productList: "PRODUKTUM LISTA",
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
    units: "Egység(Db/kg/méter/stb..)",
    salesPrice: "Eladási ár",
    creationDate: "Létrehozva",
    lastModifiedDate: "Utolsó módosítás",
    save: "Mentés",
    searchByCategory: 'Keresés kategória szerint',
    selectCategory: 'Kérem válasszon kategóriát',
    selectsubCategory: 'Kérem válasszon alkategóriát',
    deleteText: "Biztosan törölni szeretné a tartalmat?",
    delete: "Törlés",
    cancel: "Mégse",
    edit: "Szerkeszt",
    search: "Keresés",
  },
};

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
  currency: string;
  salesPrice: number;
  units: string;
  date: string;
  lastModifiedDate: string;
}

export default function ListPage() {
  const { user } = useClerk();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedsubCategory, setSelectedsubCategory] = useState<string | null>(null);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Product>({
    productName: "",
    productType: "",
    artNumber: 0,
    category: "",
    subCategory: "",
    quantity: 0,
    vatNumber: 0,
    stockValue: 0.0,
    purchasePrice: 0.0,
    salesPrice: 0.0,
    units: "",
    currency: "",
    date: "",
    lastModifiedDate: "",
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingProductData, setEditingProductData] = useState({
    productName: "",
    productType: "",
    artNumber: 0,
    category: "",
    subCategory: "",
    quantity: 0,
    vatNumber: 0,
    stockValue: 0.0,
    purchasePrice: 0.0,
    salesPrice: 0.0,
    units: "",
    currency: "",
    date: "",
    lastModifiedDate: "",
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [formattedTime, setFormattedTime] = useState(currentTime.toLocaleDateString() + " " + currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
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


  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => clearTimeout(loadingTimeout);
  }, []);


  const [language, setLanguage] = useState<string>("en"); //Alapértelmezett angol
  const translation = translations[language];
  useEffect(() => {
    const clientLanguage = getLanguage();
    setLanguage(clientLanguage);
  }, []);


  // Hozzáad egy adatsort a listához
  const addDataToList = (data: Product) => {
    setProducts([...products, data]);
  };

  // Kategóriák fetchelése
  useEffect(() => {
    if (user && user.id) {
      // Kategóriák lekérése
      const categoriesRef = ref(database, `/users/data/${user.id}/categories`);

      onValue(categoriesRef, (snapshot) => {
        const categoriesData = snapshot.val();
        if (categoriesData) {
          const categoriesList = Object.keys(categoriesData);
          setCategories(categoriesList);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedCategory) {
      // Kategóriák lekérése
      const subcategoriesRef = ref(database, `/users/data/${user.id}/categories/${selectedCategory}`);

      onValue(subcategoriesRef, (snapshot) => {
        const subCategoriesData = snapshot.val();
        if (subCategoriesData) {
          const subCategoriesList = Object.keys(subCategoriesData);
          setSubCategories(subCategoriesList);
        }
      });
    }
  }, [user, selectedCategory]);

  // Products lekérése
  useEffect(() => {
    if (user && selectedCategory && selectedsubCategory) {
      // Termékek lekérése az adott alkategóriából
      const productsRef = ref(database, `/users/data/${user.id}/categories/${selectedCategory}/${selectedsubCategory}`);

      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          // Az adatokból egy tömb létrehozása
          const productsArray: Product[] = [];
          Object.entries(data).forEach(([productId, product]: [string, Product]) => {
            productsArray.push({
              ...product,
              category: selectedCategory,
              subCategory: selectedsubCategory,
            });
          });

          // Állapot frissítése
          setProducts(productsArray);
        }
      });
    }
  }, [user, selectedCategory, selectedsubCategory]);

  // Űrlap kezelése
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [e.target.name]: e.target.value,
      });
      // Frissítsd az editingProductData-t is, hogy megjelenjenek az aktuális adatok
      setEditingProductData((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
      }));
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  //Form ,űrlap kezelése
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productName && formData.category) {
      const dataWithCategories = {
        ...formData,
        category: selectedCategory || "", // Itt a selectedCategory-t használd
        subCategory: selectedsubCategory || "", // Itt a selectedsubCategory-t használd
      };

      addDataToList(dataWithCategories);
      // Töröljük az űrlap tartalmát
      setFormData({
        productName: "",
        productType: "",
        artNumber: 0,
        category: "",
        subCategory: "",
        quantity: 0,
        vatNumber: 0,
        stockValue: 0.0,
        purchasePrice: 0.0,
        salesPrice: 0.0,
        units: "",
        currency: "",
        date: "",
        lastModifiedDate: "",
      });
    }
  };



  //Up-to-date metódusok
  const handleEdit = (index: number) => {
    setEditingProductIndex(index);
    setEditingProduct(products[index]);
    // Állítsd be az aktuális termék adatait az editingProductData állapotba
    setEditingProductData({
      productName: products[index].productName,
      productType: products[index].productType,
      artNumber: products[index].artNumber,
      category: products[index].category,
      subCategory: products[index].subCategory,
      quantity: products[index].quantity,
      vatNumber: products[index].vatNumber,
      stockValue: products[index].stockValue,
      purchasePrice: products[index].purchasePrice,
      salesPrice: products[index].salesPrice,
      units: products[index].units,
      currency: products[index].currency,
      date: products[index].date,
      lastModifiedDate: products[index].lastModifiedDate,
    });
    setSelectedCategory(products[index].category);
    setSelectedsubCategory(products[index].subCategory);
  };


  const handleSave = async () => {
    if (editingProduct && user && user.id && editingProductIndex !== null && selectedCategory && selectedsubCategory) {
      const productToUpdate = products[editingProductIndex];
      const productRef = ref(database, `/users/data/${user.id}/categories/${selectedCategory}/${selectedsubCategory}/${productToUpdate.artNumber}`);


      try {
        const updatedProductData = {
          ...editingProductData,
          lastModifiedDate: formattedTime,
        };

        await set(productRef, updatedProductData);

        setProducts((prevProducts) => {
          const updatedProducts = [...prevProducts];
          updatedProducts[editingProductIndex] = {
            ...updatedProducts[editingProductIndex],
            ...updatedProductData,
          };
          return updatedProducts;
        });

        setEditingProduct(null);
        setEditingProductIndex(null);
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }
  };


  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleDeleteConfirmation = (isVisible, index = null) => {
    setDeleteIndex(index);
    setIsDeleteDialogVisible(isVisible);
  };

  const handleDelete = (index: number) => {
    if (isDeleteDialogVisible) {
      executeDelete(index);
    } else {
      // Ha a törlési dialógus nem látható, akkor csak megnyitjuk azt
      handleDeleteConfirmation(true, index); // Itt adjuk át az indexet a handleDeleteConfirmation függvénynek
    }
  };

  const executeDelete = async (index: number) => {
    const productToDelete = products[index];

    if (user && user.id && productToDelete) {
      try {
        const productRefToDelete = ref(database, `/users/data/${user.id}/categories/${productToDelete.category}/${productToDelete.subCategory}/${productToDelete.artNumber}`);

        await remove(productRefToDelete);

        setProducts((prevProducts) => prevProducts.filter((product) => product.artNumber !== productToDelete.artNumber));
      } catch (error) {
        console.error("Hiba a termék törlésekor:", error);
      }
    } else {
      console.log("A feltétel nem teljesült!");
    }

    // Bezárjuk a törlési dialógust
    handleDeleteConfirmation(false);
  };

 
  const DeleteDialog = () => {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isDeleteDialogVisible ? "block" : "hidden"}`}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-md">
          <p>{translation.deleteText}</p>
          <div className="mt-4 flex justify-end">
            <button className="bg-black72 text-white p-2 rounded-md mr-2" onClick={() => handleDeleteConfirmation(false)}>
              {translation.cancel}
            </button>
            <button className="bg-red text-white p-2 rounded-md" onClick={() => executeDelete(deleteIndex)}>
              {translation.delete}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="text-black w-full">
        {isLoading && (
        <div className="">
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full border-t-4 border-blue-500 border-solid h-16 w-16 mb-4"></div>
            <p className="text-2xl font-semibold animate-pulse">Loading...</p>
          </div>
        </div>
      )}
      {!isLoading && (
        <div className="w-auto lg:mx-auto mt-6 p-2 lg:p-12  bg-white rounded-md shadow-md ">
          <h1 className="flex justify-center text-black56 font-bold text-2xl mb-6">{translation.searchByCategory}</h1>
          {categories.length > 0 && (
            <div className="">
              {/* <h2 className="font-bold">{translation.category}</h2> */}
              <div className="my-2 bg-white p-1 flex border border-black72 font-bold rounded ">
                <div className="flex flex-auto flex-wrap"></div>
                <select
                  className="p-1 px-2 appearance-none outline-none w-full text-blue font-bold cursor-pointer"
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                  }}
                  value={selectedCategory || ""}>
                  <option className="text-black56" value="">
                    {translation.selectCategory}
                  </option>
                  {categories.map((category) => (
                    <option className="text-black56" style={{ color: "black", margin: "16px" }} key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {subCategories.length > 0 && (
            <div className="">
              {/* <h2 className="font-bold">{translation.subCategory}</h2> */}
              <div className="my-2 bg-white p-1 flex border border-black72 rounded">
                <div className="flex flex-auto flex-wrap"></div>
                <select className="p-1 px-2 appearance-none outline-none w-full text-blue font-bold cursor-pointer" onChange={(e) => setSelectedsubCategory(e.target.value)} value={selectedsubCategory || ""}>
                  <option className="text-black56" value="">
                    {translation.selectsubCategory}
                  </option>
                  {subCategories.map((subCategory) => (
                    <option className="text-black56" style={{ color: "black", margin: "16px" }} key={subCategory} value={subCategory}>
                      {subCategory}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="w-auto relative shadow-md sm:rounded-lg overflow-x-auto">
            <table className="w-full sm:min-w-[768px] text-xs sm:text-sm text-left rtl:text-right text-black56 mt-4">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  {products.some((product) => product.artNumber) && <th className="px-1 py-1 text-center dark:bg-grey">{translation.artNumber}</th>}
                  {products.some((product) => product.productName) && <th className="px-1 py-1 text-center dark:bg-grey">{translation.productName}</th>}
                  {products.some((product) => product.productType) && <th className="px-1 py-1 text-center dark:bg-grey">{translation.productType}</th>}
                  {products.some((product) => product.category) && <th className="px-1 py-1 text-center dark:bg-grey">{translation.category}</th>}
                  {products.some((product) => product.purchasePrice) && <th className="px-1 py-1 text-center dark:bg-grey">{translation.purchasePrice}</th>}
                  {products.some((product) => product.salesPrice) && <th className="px-1 py-1 text-center dark:bg-grey">{translation.salesPrice}</th>}
                  {products.some((product) => product.productName && product.units) && <th className="text-center px-1 py-1 dark:bg-grey">{translation.quantity}/ {translation.units}</th>}
                  {products.some((product) => product.stockValue) && <th className="px-1 py-1 text-center dark:bg-grey">{translation.stockValue}</th>}
                  {products.some((product) => product.vatNumber) && <th className="px-1 py-1 text-center dark:bg-grey">VAT %</th>}
                  {products.some((product) => product.date) && <th className="px-1 py-1 text-center dark:bg-grey">{translation.creationDate}</th>}
                  {products.some((product) => product.lastModifiedDate) && <th className="px-1 py-1 text-center dark:bg-grey">{translation.lastModifiedDate}</th>}
                  <th className="px-1 py-1 text-center dark:bg-grey">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={String(product.artNumber)} className={`bg-white border-b dark:bg-grey border-darkgrey hover:bg-grey dark:hover:bg-darkgrey `}>
                    <td className="px-2 py-1 text-center">
                      {editingProductIndex === index ? (
                        <input
                          type="number"
                          name="artNumber"
                          className="p-1 text-center"
                          value={editingProductData.artNumber}
                          placeholder={editingProduct?.artNumber.toString()}
                          onChange={(e) =>
                            setEditingProductData((prevData) => ({
                              ...prevData,
                              artNumber: parseInt(e.target.value) || 0,
                            }))
                          }
                        />
                      ) : (
                        product.artNumber
                      )}
                    </td>
                    {products.some((product) => product.productName) && (
                      <td className="pl-2 py-1 text-center">
                        {editingProductIndex === index ? (
                          <input
                            type="text"
                            name="productName"
                            placeholder={editingProduct?.productName}
                            className="p-1 "
                            value={editingProductData.productName}
                            onChange={(e) =>
                              setEditingProductData((prevData) => ({
                                ...prevData,
                                productName: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          product.productName
                        )}
                      </td>
                    )}
                    {products.some((product) => product.productType) && (
                      <td className="pl-2 py-1 text-center">
                        {editingProductIndex === index ? (
                          <input
                            type="text"
                            name="productType"
                            placeholder={editingProduct?.productType}
                            className="p-1"
                            value={editingProductData.productType}
                            onChange={(e) =>
                              setEditingProductData((prevData) => ({
                                ...prevData,
                                productType: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          product.productType
                        )}
                      </td>
                    )}
                    <td className="px-3 py-1 text-center">
                      {editingProductIndex === index ? (
                        <input type="text" name="category" className="p-1" value={editingProductData.category} placeholder={editingProduct?.category} readOnly />
                      ) : (
                        product.category
                      )}
                    </td>

                    {products.some((product) => product.purchasePrice) && (
                      <td className="px-3 py-1 text-center">
                        {editingProductIndex === index ? (
                          <input
                            type="text"
                            name="purchasePrice"
                            className="p-1"
                            value={editingProductData.purchasePrice}
                            placeholder={editingProduct?.purchasePrice.toString()}
                            onChange={(e) =>
                              setEditingProductData((prevData) => ({
                                ...prevData,
                                purchasePrice: parseFloat(e.target.value) || 0.0,
                              }))
                            }
                          />
                        ) : (
                          <span>{product.purchasePrice}</span>
                        )}
                      </td>
                    )}

                    {products.some((product) => product.salesPrice) && (
                      <td className="px-1 py-1 text-center">
                        {editingProductIndex === index ? (
                          <input
                            type="text"
                            name="salesPrice"
                            className="p-1"
                            value={editingProductData.salesPrice}
                            placeholder={editingProduct?.salesPrice.toString()}
                            onChange={(e) =>
                              setEditingProductData((prevData) => ({
                                ...prevData,
                                salesPrice: parseFloat(e.target.value) || 0.0,
                              }))
                            }
                          />
                        ) : (
                          <span>{product.salesPrice}</span>
                        )}
                      </td>
                    )}

                    {products.some((product) => typeof product.quantity !== "undefined" && typeof product.units !== "undefined") && (
                      <td className="px-1 py-1 text-center">
                        {editingProductIndex === index ? (
                          <input
                            type="text"
                            name="quantity"
                            className="p-1"
                            placeholder={editingProduct?.quantity.toString()}
                            value={editingProductData.quantity}
                            onChange={(e) =>
                              setEditingProductData((prevData) => ({
                                ...prevData,
                                quantity: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        ) : (
                          `${product.quantity || 0} / ${product.units || 0}`
                        )}
                      </td>
                    )}

                    {products.some((product) => product.stockValue) && (
                      <td className="px-1 py-1 text-center">
                        {editingProductIndex === index ? (
                          <input
                            type="text"
                            name="stockValue"
                            className="p-1"
                            placeholder={editingProduct?.stockValue.toString()}
                            value={editingProductData.purchasePrice * editingProductData.quantity}
                            onChange={(e) =>
                              setEditingProductData((prevData) => ({
                                ...prevData,
                                stockValue: parseFloat(e.target.value) || 0.0,
                              }))
                            }
                          />
                        ) : (
                          `${product.purchasePrice * product.quantity}.-${product.currency || ""}`
                        )}
                      </td>
                    )}

                    {products.some((product) => product.vatNumber) && (
                      <td className="px-1 py-1 text-center text-xs ">
                        {editingProductIndex === index ? (
                          <input
                            type="number"
                            name="vatNumber"
                            className="p-1"
                            value={editingProductData.vatNumber}
                            placeholder={editingProduct?.vatNumber.toString()}
                            onChange={(e) =>
                              setEditingProductData((prevData) => ({
                                ...prevData,
                                vatNumber: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        ) : product.vatNumber ? (
                          <span>{product.vatNumber}</span>
                        ) : null}
                      </td>
                    )}

                    {products.some((product) => product.date) && (
                      <td className="px-1 py-1 text-center text-xs">
                        {editingProductIndex === index ? (
                          <input type="text" name="date" className="p-1 " value={editingProductData.date} placeholder={editingProduct?.date} readOnly />
                        ) : product.date ? (
                          <span>{product.date}</span>
                        ) : null}
                      </td>
                    )}

                    {products.some((product) => product.lastModifiedDate) && (
                      <td className="px-1 py-1 text-center text-xs">
                        {editingProductIndex === index ? (
                          <input type="text" name="date" className="p-1 " value={editingProductData.lastModifiedDate} placeholder={editingProduct?.lastModifiedDate} readOnly />
                        ) : product.lastModifiedDate ? (
                          <span>{product.lastModifiedDate}</span>
                        ) : null}
                      </td>
                    )}
                    <td className="p-2">
                      {editingProductIndex === index ? (
                        <button className="bg-green text-white p-1 rounded-md mr-3 " onClick={handleSave}>
                          Save
                        </button>
                      ) : (
                        <button className="bg-darkyellow text-black font-bold p-1 px-3 rounded-md mr-1 hover:bg-white" onClick={() => handleEdit(index)}>
                          Edit
                        </button>
                      )}
                      <button className="bg-red text-black font-bold p-1 rounded-md mr-1" onClick={() => handleDelete(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DeleteDialog />
        </div>
        )}
    </div>
  );
}
