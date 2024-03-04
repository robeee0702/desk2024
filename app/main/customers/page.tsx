"use client";
import Shared from "@/app/components/Shared";
import { database } from "@/firebase";
import { useClerk } from "@clerk/nextjs";
import { onValue, ref, set } from "firebase/database";
import { useEffect, useState } from "react";


interface Product {
  productName: string;
  artNumber: number;
  category: string;
  quantity: number;
  purchasePrice: number;
  salesPrice: number;
  units: string;
}

export default function CustomerPage() {

/**
 *     Itt jelenleg nem fut semmi,csak minta  !!!!
 */

  const { user } = useClerk();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  

  useEffect(() => {
    if (user && user.id) {
      // Kategóriák lekérése
      const categoriesRef = ref(database, `/users/data/${user.fullName}/categories`);
  
      onValue(categoriesRef, (snapshot) => {
        const categoriesData = snapshot.val();
        if (categoriesData) {
          const categoriesList = Object.keys(categoriesData);
          setCategories(categoriesList);
        }
      });
    }
  }, [user]);
  
  // Felhasználó megosztott
  useEffect(() => {
  if (user && selectedCategory) {
    // Termékek lekérése az adott kategóriából
    const productsRef = ref(
      database,
      `/users/data/${user.fullName}/categories/${selectedCategory}`
    );
  
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
  
      if (data) {
        // Az adatokból egy tömb létrehozása
        const productsArray: Product[] = [];
        Object.entries(data).forEach(
          ([productId, product]: [string, Product]) => {
            productsArray.push({
              ...product,
              category: selectedCategory,
            });
          }
        );
  
        // Állapot frissítése
        setProducts(productsArray);
      }
    });
  }
  }, [user, selectedCategory]);

  return (
    <div>
      {user ? (
        <div>
          customers
        </div>
      ) : (
        <p>Please sign in with Clerk.</p>
      )}
    </div>
  );
}
