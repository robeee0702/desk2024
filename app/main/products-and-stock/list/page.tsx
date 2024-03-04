"use client";
import { useClerk } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { database } from "@/firebase";
import { onValue, ref, remove, update } from "firebase/database";
import Search from "@/app/components/Search";
import { getLanguage } from "@/app/constants";

const translations = {
  en: {
    productList: "PRODUCT LIST",
    category: "Category",
    subCategory: "Sub category(e.g. Manufactur..)",
    productName: "Product name",
    productType: "Product type",
    quantity: "Quantity ",
    purchasePrice: "Purchase Price",
    artNumber: "Art number",
    date: "Creation Date",
    vatNumber: "VAT %",
    units: "Units (pc/kg/meter..)",
    salesPrice: "Sales Price",
    currency: "Currency",
    stockValue: "Stock Value",
    creationDate: "Creation date",
    lastModifiedDate: "Last modified date",
    save: "Save",

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
    quantity: "Menge ",
    purchasePrice: "Einkaufspreis",
    artNumber: "Artikelnummer",
    units: "Einheiten (Stk/kg/meter..)",
    vatNumber: "Steuer %",
    salesPrice: "Verkaufspreis",
    stockValue: "Bestand Wert",
    currency: "Währung",
    creationDate: "Erstellungsdatum",
    lastModifiedDate: "Letzte änderung",
    save: "Speichern",

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
    quantity: "Mennyiség ",
    purchasePrice: "Beszerzési ár",
    vatNumber: "ÁFA %",
    artNumber: "Cikkszám",
    stockValue: "Készlet érték",
    currency: "Valuta",
    units: "Egység (Db/kg/méter..)",
    salesPrice: "Eladási ár",
    creationDate: "Létrehozva",
    lastModifiedDate: "Utolsó módosítás",
    save: "Mentés",

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
  salesPrice: number;
  currency: string;
  units: string;
  date: string;
  lastModifiedDate: string;
}

interface Category {
  [subCategory: string]: Product;
}

export default function ListPage() {
  const { user } = useClerk();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [filteredIndexes, setFilteredIndexes] = useState<number[]>([]);

  const [language, setLanguage] = useState<string>("en"); //Alapértelmezett angol
  const translation = translations[language];
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

  useEffect(() => {
    const indexes: number[] = [];
    products.forEach((product, index) => {
      if (Object.values(product).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()))) {
        indexes.push(index);
      }
    });
    setFilteredIndexes(indexes);
  }, [products, searchTerm]);

  const [formData, setFormData] = useState<Product>({
    productName: "",
    productType: "",
    artNumber: 0,
    category: "",
    subCategory: "",
    quantity: 0,
    vatNumber: 0,
    stockValue: 0.0,
    currency: "",
    purchasePrice: 0.0,
    salesPrice: 0.0,
    units: "",
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
    currency: "",
    stockValue: 0.0,
    purchasePrice: 0.0,
    salesPrice: 0.0,
    units: "",
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
    }, 6000);

    return () => clearInterval(intervalId);
  }, []);

  // Hozzáad egy adatsort a listához
  const addDataToList = (data: Product) => {
    setProducts([...products, data]);
  };

  useEffect(() => {
    if (user && user.id) {
      // Összes termék lekérése
      const allProductsRef = ref(database, `/users/data/${user.id}/categories`);
      onValue(allProductsRef, (snapshot) => {
        const data: { [category: string]: Category } = snapshot.val();
        if (data) {
          const allProducts: Product[] = [];

          // Iterate through categories
          Object.entries(data).forEach(([category, subCategories]) => {
            // Iterate through subcategories
            Object.entries(subCategories).forEach(([subCategory, products]) => {
              const categoryProducts: Product[] = Object.values(products);

              // Add category and subCategory properties to each product
              const productsWithCategories = categoryProducts.map((product) => ({
                ...product,
                category,
                subCategory,
              }));

              allProducts.push(...productsWithCategories);
            });
          });

          setProducts(allProducts);
        }
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingProductData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  //Form ,űrlap kezelése
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.productName && formData.category) {
      // Töröljük az űrlap tartalmát
      setFormData({
        productName: "",
        productType: "",
        artNumber: 0,
        category: "",
        subCategory: "",
        quantity: 0,
        vatNumber: 0,
        currency: "",
        stockValue: 0.0,
        purchasePrice: 0.0,
        salesPrice: 0.0,
        units: "",
        date: "",
        lastModifiedDate: "",
      });
    }
  };

  const handleEdit = (index: number) => {
    setEditingProductIndex(index);
    setEditingProductData(products[index]);
  };

  const handleSave = async () => {
    const productToUpdate = products[editingProductIndex];

    if (!productToUpdate || !productToUpdate.category || !productToUpdate.subCategory) {
      console.error("Invalid product data for update.");
      return;
    }
    const calculatedStockValue = editingProductData.purchasePrice * editingProductData.quantity;


    const productRef = ref(database, `/users/data/${user.id}/categories/${productToUpdate.category}/${productToUpdate.subCategory}/${productToUpdate.artNumber}`);

    try {
      const updatedProductData = {
        ...editingProductData,
        stockValue: calculatedStockValue,
        lastModifiedDate: formattedTime,
      };

      // Frissítés az adatbázisban
      await update(productRef, updatedProductData);

      // Frissítés az állapotban
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
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
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
    <div className="text-black w-full ">
      {isLoading && (
        <div className="">
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full border-t-4 border-blue-500 border-solid h-16 w-16 mb-4"></div>
            <p className="text-2xl font-semibold animate-pulse">Loading...</p>
          </div>
        </div>
      )}
      {!isLoading && (
        <div className="">
          <div className="lg:mx-auto mt-2 p-4 lg:p-8">
            <h2 className="flex justify-center text-black font-bold text-2xl mb-5">{translation.productList}</h2>
            <div className="relative overflow-x-auto">
              <div className="shadow-md rounded-md">
                <Search onChange={handleSearch} search={`${translation.search}...`} />
              </div>
              <table className="w-full text-xs rtl:text-right text-black56 mt-6 shadow-black shadow-2xl">
                <thead>
                  <tr>
                    <th className="py-1 dark:bg-white">{translation.artNumber}</th>
                    {products.some((product) => product.productName) && <th className="px-1 py-1 dark:bg-white">{translation.productName}</th>}
                    {products.some((product) => product.productType) && <th className="px-1 py-1 dark:bg-white">{translation.productType}</th>}
                    <th className="px-2 py-1 dark:bg-white">{translation.category}</th>
                    {products.some((product) => product.purchasePrice) && <th className="px-1 py-1 dark:bg-white">{translation.purchasePrice}</th>}
                    {products.some((product) => product.salesPrice) && <th className="px-1 py-1 dark:bg-white">{translation.salesPrice}</th>}
                    {products.some((product) => product.productName && product.units) && (
                      <th className="px-1 py-1 dark:bg-white">
                        {translation.quantity}/{translation.units}
                      </th>
                    )}
                    {products.some((product) => product.stockValue) && <th className="px-1 py-1 dark:bg-white">{translation.stockValue}</th>}
                    {products.some((product) => product.vatNumber) && <th className="px-1 py-1 dark:bg-white">{translation.vatNumber}</th>}
                    {products.some((product) => product.date) && <th className="px-1 py-1 dark:bg-white">{translation.creationDate}</th>}
                    {products.some((product) => product.lastModifiedDate) && <th className="px-1 py-1 dark:bg-white">{translation.lastModifiedDate}</th>}
                    <th className="px-1 py-1 dark:bg-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIndexes.map((index) => {
                    const product = products[index];
                    return (
                      <tr key={index} className={`bg-white border-b border-darkgrey hover:bg-grey dark:hover:bg-darkgrey`}>
                        <td className="px-2 py-1 text-center">
                          {editingProductIndex === index ? (
                            <input
                              type="number"
                              name="artNumber"
                              className="w-16 md:w-16 lg:w-20 xl:w-28 p-1"
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
                            product?.artNumber
                          )}
                        </td>
                        {products.some((product) => product.productName) && (
                          <td className="pl-2 py-1 text-center">
                            {editingProductIndex === index ? (
                              <input
                                type="text"
                                name="productName"
                                placeholder={editingProduct?.productName}
                                className="w-10 md:w-12 lg:w-14 xl:w-20 p-1"
                                value={editingProductData.productName}
                                onChange={(e) =>
                                  setEditingProductData((prevData) => ({
                                    ...prevData,
                                    productName: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              product?.productName
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
                                className="w-10 md:w-12 lg:w-14 xl:w-20 p-1"
                                value={editingProductData.productType}
                                onChange={(e) =>
                                  setEditingProductData((prevData) => ({
                                    ...prevData,
                                    productType: e.target.value,
                                  }))
                                }
                              />
                            ) : (
                              product?.productType
                            )}
                          </td>
                        )}
                        <td className="px-3 py-1 text-center">
                          {editingProductIndex === index ? (
                            <input type="text" name="category" className="w-10 md:w-12 lg:w-14 xl:w-20 p-1" value={editingProductData.category} placeholder={editingProduct?.category} readOnly />
                          ) : (
                            product?.category
                          )}
                        </td>

                        {products.some((product) => product.purchasePrice) && (
                          <td className="px-3 py-1 text-center">
                            {editingProductIndex === index ? (
                              <input
                                type="text"
                                name="purchasePrice"
                                className="w-4 md:w-8 lg:w-12 xl:w-20 p-1"
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
                              <span>
                                {product?.purchasePrice}.-
                                {product?.currency || ""}
                              </span>
                            )}
                          </td>
                        )}

                        {products.some((product) => product.salesPrice) && (
                          <td className="px-1 py-1 text-center">
                            {editingProductIndex === index ? (
                              <input
                                type="text"
                                name="salesPrice"
                                className="w-4 md:w-8 lg:w-12 xl:w-20 p-1"
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
                              <span>
                                {product?.salesPrice}.-{product?.currency || ""}
                              </span>
                            )}
                          </td>
                        )}

                        {products.some((product) => typeof product.quantity !== "undefined" && typeof product.units !== "undefined") && (
                          <td className="px-1 py-1 text-center">
                            {editingProductIndex === index ? (
                              <>
                                <input
                                  type="text"
                                  name="quantity"
                                  className="w-4 md:w-8 lg:w-12 xl:w-20 p-1"
                                  placeholder={editingProduct?.quantity.toString()}
                                  value={editingProductData.quantity}
                                  onChange={(e) =>
                                    setEditingProductData((prevData) => ({
                                      ...prevData,
                                      quantity: parseInt(e.target.value) || 0,
                                    }))
                                  }
                                />
                                <input
                                  type="text"
                                  name="units"
                                  className=" mx-1 w-4 md:w-8 lg:w-12 xl:w-20 p-1"
                                  placeholder={editingProduct?.units.toString()}
                                  value={editingProductData.units}
                                  onChange={(e) =>
                                    setEditingProductData((prevData) => ({
                                      ...prevData,
                                      units: e.target.value || '',
                                    }))
                                  }
                                />
                              </>
                            ) : (
                              `${product?.quantity || 0} / ${product?.units || 0}`
                            )}
                          </td>
                        )}

                        {products.some((product) => product.stockValue) && (
                          <td className="px-1 py-1 text-center">
                            {editingProductIndex === index ? (
                              <input
                                type="text"
                                name="stockValue"
                                className="w-4 md:w-8 lg:w-12 xl:w-20 p-1"
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
                              `${product?.purchasePrice * product?.quantity}.-${product?.currency || ""}`
                            )}
                          </td>
                        )}

                        {products.some((product) => product.vatNumber) && (
                          <td className="px-1 py-1 text-xs text-center">
                            {editingProductIndex === index ? (
                              <input
                                type="number"
                                name="vatNumber"
                                className="w-4 md:w-8 lg:w-12 xl:w-20 p-1"
                                value={editingProductData.vatNumber}
                                placeholder={editingProduct?.vatNumber.toString()}
                                onChange={(e) =>
                                  setEditingProductData((prevData) => ({
                                    ...prevData,
                                    vatNumber: parseInt(e.target.value) || 0,
                                  }))
                                }
                              />
                            ) : product?.vatNumber ? (
                              <span>{product?.vatNumber}</span>
                            ) : null}
                          </td>
                        )}

                        {products.some((product) => product.date) && (
                          <td className="px-1 py-1 text-xs text-center">
                            {editingProductIndex === index ? (
                              <input type="text" name="date" className="w-4 md:w-8 lg:w-12 xl:w-20 p-1 " value={editingProductData.date} placeholder={editingProduct?.date} readOnly />
                            ) : product?.date ? (
                              <span>{product?.date}</span>
                            ) : null}
                          </td>
                        )}

                        {products.some((product) => product.lastModifiedDate) && (
                          <td className="px-1 py-1 text-xs text-center">
                            {editingProductIndex === index ? (
                              <input type="text" name="date" className="w-4 md:w-8 lg:w-12 xl:w-20 p-1 " value={editingProductData.lastModifiedDate} placeholder={editingProduct?.lastModifiedDate} readOnly />
                            ) : product?.lastModifiedDate ? (
                              <span>{product?.lastModifiedDate}</span>
                            ) : null}
                          </td>
                        )}
                        <td className="p-2 text-center">
                          {editingProductIndex === index ? (
                            <button className="bg-green text-white p-1 rounded-md mr-1 hover:opacity-70" onClick={handleSave}>
                              {translation.save}
                            </button>
                          ) : (
                            <button className="bg-yellow text-black font-bold p-1 px-3 rounded-md mr-1 hover:opacity-80" onClick={() => handleEdit(index)}>
                              {translation.edit}
                            </button>
                          )}
                          <button className="bg-red opacity-90 text-white font-bold p-1 rounded-md mr-1 hover:bg-opacity-60" onClick={() => handleDelete(index)}>
                            {translation.delete}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <DeleteDialog />
        </div>
      )}
    </div>
  );
}
