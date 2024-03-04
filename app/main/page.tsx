"use client";

import { database } from "@/firebase";
import { useClerk, auth } from "@clerk/nextjs";
import { ref, onValue, set, get } from "firebase/database";
import { useEffect, useState } from "react";
import { startOfWeek, endOfWeek, format } from "date-fns";
import Logo from "@/public/tech_logo.svg";
import { LuMailPlus } from "react-icons/lu";

import Counter from "../components/Counter";
import dynamic from "next/dynamic";
import Image from "next/image";
import { getLanguage } from "../constants";

// ApexCharts dinamikus importálása SSR támogatás nélkül
const ApexCharts = dynamic(() => import("react-apexcharts"), { ssr: false });

const translations = {
  en: {
    partners: "PARTNERS",
    products: "PRODUCTS",
    budget: "BUDGET",
    totalStockvalue: "TOTAL STOCKVALUE",
    stockCapacity: "STOCK CAPACITY",
    notEvents: "There is no events on this week..",
    eventweek: "EVENTS ON THIS WEEK",
    totalIncome: "Total Income:",
    totalExpenses: "Total Expenses",
    totalBalance: "Total Balance:",
  },
  de: {
    partners: "PARTNERS",
    products: "PRODUKTE",
    budget: "BUDGET",
    totalStockvalue: "TOTAL LAGERWERT",
    stockCapacity: "LAGER KAPAZITÄT",
    notEvents: "Keine Events in dieser Woche..",
    eventweek: "Events unter der Woche",
    totalIncome: "Total einkommen:",
    totalExpenses: "Total ausgabe:",
    totalBalance: "Total Balance:",
  },
  hu: {
    partners: "PARTNEREK",
    products: "TERMÉKEK",
    budget: "KÖLTSÉGVETÉS",
    totalStockvalue: "TELJES KÉSZLETÉRTÉK",
    stockCapacity: "KÉSZLET KAPACITÁS",
    notEvents: "Ezen a héten nincs esemény..",
    eventweek: "ESEMÉNYEK A HÉTEN",
    totalIncome: "Összes bevétel:",
    totalExpenses: "Összes kiadás",
    totalBalance: "Egyenleg:",
  },
};

interface MemberData {
  [key: string]: {
    id: string;
    name: string;
    email: string;
  };
}
interface HeatmapData {
  x: string;
  y: string;
  z: number;
}

interface Product {
  productName: string;
  artNumber: number;
  category: string;
  quantity: number;
  purchasePrice: number;
  salesPrice: number;
  units: string;
}

interface Category {
  [subCategory: string]: Product;
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
export default function MainPage() {
  const { user } = useClerk();
  const [data, setData] = useState<MemberData | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [language, setLanguage] = useState<string>("en"); //Alapértelmezett angol
  const translation = translations[language];
  useEffect(() => {
    const clientLanguage = getLanguage();
    setLanguage(clientLanguage);
  }, []);

  //Felhasználók lekérése
  useEffect(() => {
    if (user && user.id) {
      const dbRef = ref(database, `users/members/${user.fullName}`);

      onValue(dbRef, (snapshot) => {
        setData(snapshot.val());
      });
      const newMemberData: MemberData = {
        [user.id]: {
          id: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress.emailAddress,
        },
      };

      // Using set method to overwrite the existing data
      set(dbRef, { ...data, ...newMemberData });
    }
  }, [user]);

  // Lekérés
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

  const [products, setProducts] = useState([]);
  const [partners, setPartners] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2200);

    return () => clearTimeout(loadingTimeout);
  }, []);

  const totalStockValueByCurrency = products.reduce((accumulator, currentItem) => {
    // Ha nincs currency definiálva, akkor használjunk egy alternatív kulcsot, például 'N/A'
    const currencyKey = currentItem.currency || 'undefined';
  
    if (!accumulator[currencyKey]) {
      accumulator[currencyKey] = 0;
    }
  
    accumulator[currencyKey] += currentItem.stockValue;
  
    return accumulator;
  }, {});

  // Összes termék
  useEffect(() => {
    if (user && user.id) {
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

  const options1: ApexCharts.ApexOptions = {
    chart: {
      width: "100%",
      height: "100%",
      type: "pie",
    },
    fill: {
      colors: [
        "#BEE7EF",
        "#DFB5AF",
        "#F8D6B3",
        "#F2F7B8",
        "#C2E9F0",
        "#A3D0DF",
        "#F0C79F",
        "#E2E79F",
        "#A3DCE6",
        "#D9D19F",
        "#E3F0A1",
        "#8CC9D9",
        "#FF9AB1",
        "#F0D4AF",
        "#CDE6A1",
        "#B8D4E1",
        "#FFBBA1",
        "#F4D6B5",
        "#E5E8A1",
        "#FFC1B9",
        "#E8E1C3",
        "#F3F9C2",
        "#AEDFEC",
        "#FFBDC7",
        "#F8E4CD",
        "#E3F8BE",
        "#D6EAEF",
        "#FFD1C1",
        "#FAE8D5",
        "#F5FDC8",
      ],
    },
    legend: {
      markers: {
        fillColors: [
          "#BEE7EF",
          "#DFB5AF",
          "#F8D6B3",
          "#A3D0DF",
          "#F0C79F",
          "#E2E79F",
          "#A3DCE6",
          "#D9D19F",
          "#E3F0A1",
          "#8CC9D9",
          "#FF9AB1",
          "#F0D4AF",
          "#CDE6A1",
          "#B8D4E1",
          "#FFBBA1",
          "#F4D6B5",
          "#E5E8A1",
          "#F2F7B8",
          "#C2E9F0",
          "#FFC1B9",
          "#E8E1C3",
          "#F3F9C2",
          "#AEDFEC",
          "#FFBDC7",
          "#F8E4CD",
          "#E3F8BE",
          "#D6EAEF",
          "#FFD1C1",
          "#FAE8D5",
          "#F5FDC8",
        ],
      },
    },

    dataLabels: {
      enabled: true,
      style: {
        colors: ["#002400"],
      },
    },
    series: categories.map((category) => products.filter((product) => product.category === category).length),
    labels: categories,
  };

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [myCurrency, setMyCurrency] = useState("");
  const currentYear = new Date().getFullYear().toString();

  useEffect(() => {
    if (user && user.id) {
      const fetchTotalAmountsForYear = async () => {
        const totalAmounts = { income: 0, expenses: 0 };

        // Feltételezzük, hogy a `ref` és `get` metódusok már rendelkezésre állnak
        const yearRef = ref(database, `users/data/${user.id}/budget/${currentYear}`);
        const currencyRef = ref(database, `users/data/${user.id}/budget/currency`);
        const yearSnapshot = await get(yearRef);
        const currencySnapshot = await get(currencyRef);

        if (yearSnapshot.exists()) {
          const yearData = yearSnapshot.val();
          Object.keys(yearData).forEach((month) => {
            const monthData = yearData[month];
            ["expenses", "income"].forEach((type) => {
              if (monthData[type]) {
                Object.keys(monthData[type]).forEach((day) => {
                  const dayData = monthData[type][day];
                  if (dayData.amount) {
                    totalAmounts[type] += Number(dayData.amount);
                  }
                });
              }
            });
          });
        }

        if (currencySnapshot.exists()) {
          setMyCurrency(currencySnapshot.val());
        } else {
          setMyCurrency("USD");
        }

        setTotalIncome(totalAmounts.income);
        setTotalExpenses(totalAmounts.expenses);
      };

      fetchTotalAmountsForYear();
    }
  }, [user]);

  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      const getEventsForCurrentWeek = async () => {
        const now = new Date();
        const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
        const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 });

        const eventsRef = ref(database, `/users/data/${user.id}/calendar/allEvents`);
        const snapshot = await get(eventsRef);
        const events = snapshot.val() || {};
        const currentWeekEvents = Object.keys(events).reduce((acc, key) => {
          const event = events[key];
          const eventStartDate = new Date(event.start);
          if (eventStartDate >= startOfCurrentWeek && eventStartDate <= endOfCurrentWeek) {
            acc.push(event);
          }
          return acc;
        }, []);

        return currentWeekEvents; // Itt adjuk vissza az aktuális heti események tömbjét
      };

      const fetchEvents = async () => {
        const weekEvents = await getEventsForCurrentWeek();
        setEvents(weekEvents); // Itt frissítjük az események állapotát
      };

      fetchEvents();
    }
  }, [user]);

  const [chartWidth, setChartWidth] = useState(window.innerWidth < 640 ? 372 : window.innerWidth >= 1480 ? 740 : 640);
  const [chartHeight, setChartHeight] = useState(window.innerHeight < 640 ? 320 : window.innerHeight >= 1480 ? 700 : 560);

  useEffect(() => {
    // Az átméretezés kezelő függvénye
    function handleResize() {
      setChartWidth(window.innerWidth < 640 ? 372 : window.innerWidth >= 1480 ? 800 : 512);
      setChartHeight(window.innerHeight < 640 ? 320 : window.innerHeight >= 1480 ? 720 : 560);
    }

    // Feliratkozás az átméretezés eseményre
    window.addEventListener("resize", handleResize);

    // Kezdeti méret beállítása
    handleResize();

    // Leiratkozás az eseményről, amikor a komponens már nem aktív
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full text-black h-auto mx-auto flex flex-col">
      {isLoading && (
        <div className="">
          <div className="flex flex-col items-center justify-center h-screen">
            <div className="animate-spin rounded-full border-t-4 border-blue-500 border-solid h-16 w-16 mb-4"></div>
            <p className="text-2xl font-semibold animate-pulse">Loading...</p>
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="w-full mx-auto mt-12">
            {/* Features */}
            <div className="flex flex-wrap justify-around gap-1 mb-8 m-2">
              <div className="flex justify-center flex-col w-96 h-auto shadow-black84 shadow-xl mt-4 md:mt-2 rounded-lg p-2" style={{ backgroundColor: "#BEE7EF" }}>
                <p className="text-3xl font-bold mt-2 text-center mb-8">{translation.partners}</p>
                <div className="text-4xl font-bold text-center">
                  <Counter from={0} to={partners.length} duration={0.8} />
                </div>
              </div>
              <div className="flex justify-center flex-col w-96 h-auto shadow-black84 shadow-xl mt-4 md:mt-2 rounded-lg p-2" style={{ backgroundColor: "#FFB5AF" }}>
                <p className="text-3xl font-bold mt-2 text-center mb-8">{translation.products}</p>
                <div className="text-4xl font-bold text-center">
                  <Counter from={0} to={products.length} duration={0.8} />
                </div>
              </div>
              <div className="flex justify-center flex-col w-96 h-auto shadow-black84  shadow-xl mt-4 md:mt-2 rounded-lg p-2" style={{ backgroundColor: "#F8D6B3" }}>
                <p className="text-3xl font-semibold mt-2 text-center mb-8">
                  {translation.budget} {currentYear}
                </p>
                <div className="flex justify-around text-lg">
                  <div className="font-bold">{translation.totalIncome}</div>
                  <div className="flex">
                    <Counter from={0} to={totalIncome} duration={0.8} />
                    .-{myCurrency}
                  </div>
                </div>
                <div className="flex justify-around text-lg">
                  <div className="font-bold">{translation.totalExpenses}</div>
                  <div className="flex">
                    <Counter from={0} to={totalExpenses} duration={0.8} />
                    .-{myCurrency}
                  </div>
                </div>
                <div className="flex justify-around text-2xl">
                  <div className="font-bold">{translation.totalBalance}</div>
                  <div className="flex font-bold">
                    <Counter from={0} to={totalIncome - totalExpenses} duration={0.8} />
                    .-{myCurrency}
                  </div>
                </div>
              </div>

              <div className="flex justify-center flex-col w-96 h-auto shadow-black84  shadow-xl mt-4 md:mt-2 rounded-lg p-2" style={{ backgroundColor: "#F2F7B8" }}>
                <div className="text-3xl font-semibold mt-4 text-center mb-3">{translation.totalStockvalue}</div>
                {Object.entries(totalStockValueByCurrency).map(([currency, total]) => (
                  <div key={currency} className="flex m-2 text-2xl text-center">
                    <div className="text-2xl">
                      <Counter from={0} to={total as number} duration={0.8} />
                    </div>
                    .- {currency !== 'undefined' ? currency : ''}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 md:mx-4">
              <section className="w-full overflow-hidden">
                <div className="flex flex-col m-12 md:m-24">
                  <h1 className="text-xl font-bold mb-4">{translation.eventweek}</h1>
                  {events.length > 0 ? (
                    <div className="divide-y divide-black84 px-4 md:px-8">
                      {events.map((event) => (
                        <div key={event.id} className="py-2">
                          <span className="text-black56 font-bold">{new Date(event.start).toLocaleDateString()}</span> -{" "}
                          <span className="font-mono font-bold mx-2" style={{ color: "#1590d4" }}>
                            {event.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>{translation.notEvents}</p>
                  )}
                </div>
              </section>
              <section className="mr-auto overflow-hidden">
                <p className="text-3xl font-semibold text-center mb-8">{translation.stockCapacity}</p>
                <ApexCharts options={options1} series={options1.series} type="pie" width={chartWidth} height={chartHeight} />
              </section>
            </div>
          </div>
          {/* 3.rész: Lábléc rész */}
          <footer
            className="flex w-full justify-around bg-gradient-to-l from-black84 to-black96 mt-auto overflow-hidden"
            // style={{ boxShadow: "0 -12px 15px -5px rgba(0, 0, 0, 0.2), 0 -6px 12px -8px rgba(0, 0, 0, 0.15)" }}
          >
            <div className="flex  mt-auto">
              <a href="/">
                <Image src={Logo} className="w-48 md:w-80  object-contain" alt="logo" />
              </a>
            </div>

            {/* <!-- Üres grid cellák --> */}
            <div className="flex items-end text-black"></div>

            <div className="flex flex-col justify-center">
              <div className="mb-4 md:mb-0 "></div>

              <div className="mx-4 mb-4 md:mb-0 ">
                <LuMailPlus size={42} />
                <a href="mailto:info@tech-ventory.com" className="text-lg">
                  info@tech-ventory.com
                </a>
              </div>
            </div>

            {/* <!-- Üres grid cellák --> */}
            <div className="m-1 mt-auto">
              <ul className="list-none font-bold">
                <li>
                  {/* <a href="/about" className="text-gray-800 hover:text-gray-800">
                    About us
                  </a> */}
                </li>
                <li>
                  <a href="/privacy" className="text-center">
                    Privacy Policy
                  </a>
                </li>
                <div className="py-2 flex ">
                  <div className="text-black font-bold"> Copyright &copy; 2024 TechVentory</div>
                </div>
              </ul>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
