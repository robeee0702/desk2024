"use client";
import { getLanguage } from "@/app/constants";
import { database } from "@/firebase";
import { useClerk } from "@clerk/nextjs";
import { addWeeks } from "@fullcalendar/core/internal";
import { get, ref, set } from "firebase/database";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";

const translations = {
  en: {
    finance: "FINANCE",
    planner: "PLANNER",
    income: "INCOME",
    expenses: "EXPENSES",
    year: "YEAR",
    month: "MONTH",
    date: "DATE",
    desc: "DESCRIPTION",
    amount: "AMOUNT",
    totalIncome: "TOTAL INCOME",
    totalExpenses: "TOTAL EXPENSES",
    endingBalance: "ENDING BALANCE",
    currency: "Currency",
  },
  de: {
    finance: "FINANZEN",
    planner: "PLANER",
    income: "EINKOMMEN",
    expenses: "AUSGABEN",
    year: "JAHR",
    month: "MONAT",
    date: "DATUM",
    desc: "BESCHREIBUNG",
    amount: "BETRAG",
    totalIncome: "TOTAL EINKOMMEN",
    totalExpenses: "TOTAL AUSGABEN",
    endingBalance: "SCHLUSS SALDO",
    currency: "Währung",
  },
  hu: {
    finance: "PÉNZÜGYI",
    planner: "TERVEZŐ",
    income: "BEVÉTEL",
    expenses: "KIADÁS",
    year: "ÉV",
    month: "HÓNAP",
    date: "DÁTUM",
    desc: "LEÍRÁS",
    amount: "ÖSSZEG",
    totalIncome: "ÖSSZES BEVÉTEL",
    totalExpenses: "ÖSSZES KIADÁS",
    endingBalance: "ZÁRÓ EGYENLEG",
    currency: "Valuta",
  },
};



const autoFormatDateInput = (input) => {
  if (typeof input !== "string") {
    return ""; // vagy más, a megfelelő érték
  }

  // Törölje az összes nem szám karaktert
  const cleanedInput = input.replace(/[^0-9]/g, "");

  // Formázza a dátumot, pl. YYYYMMDD -> YYYY.MM.DD
  const formattedDate = cleanedInput.replace(/(\d{4})(\d{2})(\d{2})/, "$1.$2.$3");

  return formattedDate;
};

export default function Page() {

  const { user } = useClerk();
  const [isSaved, setIsSaved] = useState(false);
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

  const pdfRef = useRef(null);


  const generateEmptyTableData = (size, year, month) => {
    return Array.from({ length: size }, (_, index) => ({
      // A dátum mező előre kitöltve az évvel és hónappal, a napot később kell hozzáadni
      date: `${year}.${month}.${index + 1 < 10 ? `0${index + 1}` : index + 1}`,
      description: "",
      amount: "",
    }));
  };


  
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [exchangeRates, setExchangeRates] = useState({});
  const [defaultCurrency, setDefaultCurrency] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurrency);
  
  const [tableData, setTableData] = useState(generateEmptyTableData(31, selectedYear, selectedMonth.padStart(2, '0')));
  const [tableData1, setTableData1] = useState(generateEmptyTableData(31, selectedYear, selectedMonth.padStart(2, '0')));
 
  const calculateTotal = () => {
    const total = tableData.reduce((sum, rowData) => sum + parseFloat(rowData.amount || "0"), 0);
    setTotalAmount(total);
  };

  const calculateExpenses = () => {
    const total = tableData1.reduce((sum, rowData) => sum + parseFloat(rowData.amount || "0"), 0);
    setTotalExpenses(total);
  };

  const handleTableInputChange = (value, rowIndex, field) => {
    const newData = [...tableData];
    newData[rowIndex][field] = value;
    setTableData(newData);
    calculateTotal();
  };

  const handleTableInputChange1 = (value, rowIndex, field) => {
    const newData = [...tableData1];
    newData[rowIndex][field] = value;
    setTableData1(newData);
    calculateExpenses();
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.id && selectedYear && selectedMonth) {
        try {
          const incomeRef = ref(database, `users/data/${user.id}/budget/${selectedYear}/${selectedMonth}/income`);
          const expensesRef = ref(database, `users/data/${user.id}/budget/${selectedYear}/${selectedMonth}/expenses`);

          const incomeSnapshot = await get(incomeRef);
          const expensesSnapshot = await get(expensesRef);

          const incomeData = incomeSnapshot.val() || [];
          const expensesData = expensesSnapshot.val() || [];

          setTableData(incomeData.length > 0 ? incomeData : generateEmptyTableData(31, selectedYear, selectedMonth.padStart(2, '0')));
          setTableData1(expensesData.length > 0 ? expensesData : generateEmptyTableData(31, selectedYear, selectedMonth.padStart(2, '0')));

          console.log("Lefutott");
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, [user, selectedYear, selectedMonth]);


  useEffect(() => {
    const fetchCurrency = async () => {
      const currencyRef = ref(database, `users/data/${user.id}/budget/${selectedYear}/${selectedMonth}/currency`);
      const snapshot = await get(currencyRef);
      if (snapshot.exists()) {
        setSelectedCurrency(snapshot.val());
      } else {
        setSelectedCurrency('USD'); 
      }
    };
  
    if (user && user.id && selectedYear && selectedMonth) {
      fetchCurrency();
    }
  }, [user, selectedYear, selectedMonth]);

  useEffect(() => {
    calculateTotal();
  }, [tableData]);

  useEffect(() => {
    calculateExpenses();
  }, [tableData1]);

  const handleAddToTableData = async () => {
    if (!selectedYear || !selectedMonth) {
      alert("Please choose year and month!"); // Hibaüzenet megjelenítése
      return; // Ne folytassa a függvény többi részét
    }

    // Referenciák létrehozása
    const incomeRef = ref(database, `users/data/${user.id}/budget/${selectedYear}/${selectedMonth}/income`);

    const expensesRef = ref(database, `users/data/${user.id}/budget/${selectedYear}/${selectedMonth}/expenses`);

    const currencyRef = ref(database, `users/data/${user.id}/budget/currency`);

    const incomeData = tableData.map((rowData) => ({
      date: rowData.date || "",
      description: rowData.description || "",
      amount: rowData.amount || 0,
    }));

    const expensesData = tableData1.map((rowData) => ({
      date: rowData.date || "",
      description: rowData.description || "",
      amount: rowData.amount || 0,
    }));

    await set(incomeRef, incomeData);
    await set(expensesRef, expensesData);
    await set(currencyRef, selectedCurrency);

    calculateTotal();
    calculateExpenses();

    setIsSaved(true);
    setSelectedCurrency("");

    window.location.reload();
  };

  // const handlePrint = async () => {
  //   try {
  //     if (pdfRef.current) {
  //       const screenshot = pdfRef.current;

  //       // HTML2Canvas has to be imported
  //       const canvas = await html2canvas(screenshot, { scale: 2 });

  //       // Wait a bit to ensure the image is fully rendered
  //       await new Promise((resolve) => setTimeout(resolve, 500));

  //       // Download the image
  //       const link = document.createElement("a");
  //       link.href = canvas.toDataURL();
  //       link.download = "screenshot.png";
  //       link.click();
  //     }
  //   } catch (error) {
  //     console.error("Error handling print:", error);
  //   }
  //   window.location.reload();
  // };

  const handleNewSite = async () => {
    if (user && user.id && selectedYear && selectedMonth) {
      const incomeRef = ref(database, `users/data/${user.id}/budget/${selectedYear}/${selectedMonth}/income`);
      const expensesRef = ref(database, `users/data/${user.id}/budget/${selectedYear}/${selectedMonth}/expenses`);

      try {
        await set(incomeRef, null);
        await set(expensesRef, null);

        // Az adatok törlése után frissítsük a helyi állapotokat
        setTableData(generateEmptyTableData(31, selectedYear, selectedMonth.padStart(2, '0')));
        setTableData1(generateEmptyTableData(31, selectedYear, selectedMonth.padStart(2, '0')));
        setTotalAmount(0);
        setTotalExpenses(0);
        setIsSaved(false);

        console.log("Data deleted successfully.");
      } catch (error) {
        console.error("Error deleting data:", error);
      }
    }

    // Az oldal újratöltése
    window.location.reload();
  };

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

  const handleCurrencySelect = (e) => {
    const selectedCurrency = e.target.value;
    setSelectedCurrency(selectedCurrency);
  };



  

  return (
    <div>
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
          <div ref={pdfRef} className="w-full h-auto md:w-[794px] md:h-[1123px] p-0 mt-2 md:mt-4 md:p-4 border rounded-sm shadow-md overflow-hidden">
            <select className="mb-2" onChange={handleCurrencySelect} value={selectedCurrency}>
              <option value="" disabled>
                {translation.currency}
              </option>
              {exchangeRates &&
                Object.keys(exchangeRates).map((currency, index) => (
                  <option key={index} value={currency}>
                    {currency}
                  </option>
                ))}
            </select>
            <div className="grid grid-cols-2 h-auto">
              <div className="">
                <h1 className="font-serif font-bold ml-5 text-3xl md:text-5xl">{translation.finance}</h1>
                <h1 className="flex justify-end mr-6 text-3xl md:text-4xl ">{translation.planner}</h1>
              </div>
              <div className="flex flex-col m-4 p-4">
                <div className="flex">
                  <h1 className="">{translation.year}</h1>
                  <select id="yearInput" className="border-b px-1 md:px-4 border-black72 ml-4 outline-none" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                    <option value="" disabled></option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                    <option value="2028">2028</option>
                    {/* ... további évek */}
                  </select>
                </div>
                <div className="flex mt-6">
                  <h1 className="">{translation.month}</h1>
                  <select id="monthInput" className="border-b px-0 md:px-4 border-black72 ml-0 md:ml-4 outline-none" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    <option value="" disabled></option>
                    <option value="01">January</option>
                    <option value="02">February</option>
                    <option value="03">March</option>
                    <option value="04">April</option>
                    <option value="05">May</option>
                    <option value="06">June</option>
                    <option value="07">July</option>
                    <option value="08">August</option>
                    <option value="09">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                    {/* ... további hónapok */}
                  </select>{" "}
                </div>
              </div>
            </div>

            <div className="flex justify-stretch p-1 gap-1 md:p-4 md:gap-4">
              <div>
                <h1 className="mb-2 font-bold">{translation.income}</h1>
                <table className="w-1/2 ">
                  <thead>
                    <tr>
                      <th className="py-1  bg-sand font-light text-xs md:text-sm">{translation.date}</th>
                      <th className="py-1  bg-sand font-light text-xs md:text-sm">{translation.desc}</th>
                      <th className="py-1  bg-sand font-light text-xs md:text-sm">{translation.amount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((rowData, rowIndex) => (
                      <tr key={rowIndex} className="leading-none bg-sand">
                        <td className="px-1 h-4 md:h-5">
                          <input
                            type="text"
                            className="w-14 md:w-24 text-xs"
                            value={selectedYear && selectedMonth ? rowData.date : ''}
                            onChange={(e) => handleTableInputChange(autoFormatDateInput(e.target.value), rowIndex, "date")}
                            placeholder="YYYYMMDD"
                            maxLength={8}
                          />
                        </td>
                        <td className={`px-1 h-4 md:h-5`}>
                          <input type="text" className="w-14 md:w-32" value={rowData.description} onChange={(e) => handleTableInputChange(e.target.value, rowIndex, "description")} />
                        </td>

                        <td className={`text-center px-1 h-4 md:h-5`}>
                          <input type="number" className="w-10 md:w-20" value={rowData.amount} onChange={(e) => handleTableInputChange(parseFloat(e.target.value), rowIndex, "amount")} />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-1  bg-sand font-light text-xs"></td>
                      <td className="py-1  bg-sand font-light text-xs flex justify-end px-5">TOTAL:</td>
                      <td className="py-1  bg-sand font-light text-xs">
                        {totalAmount}.- {selectedCurrency}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h1 className="mb-2 font-bold">{translation.expenses}</h1>
                <table className="w-1/2 ">
                  <thead>
                    <tr>
                      <th className="py-1  bg-sand font-light text-xs md:text-sm">{translation.date}</th>
                      <th className="py-1  bg-sand font-light text-xs md:text-sm">{translation.desc}</th>
                      <th className="py-1  bg-sand font-light text-xs md:text-sm">{translation.amount}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData1.map((rowData, rowIndex) => (
                      <tr key={rowIndex} className="leading-none bg-sand">
                        <td className="px-1 h-4 md:h-5">
                          <input
                            type="text"
                            className="w-14 md:w-24 text-xs"
                            value={selectedYear && selectedMonth ? rowData.date : ''}
                            onChange={(e) => handleTableInputChange1(autoFormatDateInput(e.target.value), rowIndex, "date")}
                            placeholder="YYYYMMDD"
                            maxLength={8}
                          />
                        </td>
                        <td className="px-1 h-4 md:h-5">
                          <input type="text" className="w-14 md:w-32" value={rowData.description} onChange={(e) => handleTableInputChange1(e.target.value, rowIndex, "description")} />
                        </td>

                        <td className=" text-center px-1 h-4 md:h-5">
                          <input type="number" className="w-10 md:w-20 " value={rowData.amount} onChange={(e) => handleTableInputChange1(parseFloat(e.target.value), rowIndex, "amount")} />
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className="py-1  bg-sand font-light text-xs"></td>
                      <td className="py-1  bg-sand font-light text-xs flex justify-end px-5">TOTAL:</td>
                      <td className="py-1  bg-sand font-light text-xs">
                        {totalExpenses}.- {selectedCurrency}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-2 md:p-4 md:mt-4">
              <table className="w-full ">
                <thead>
                  <tr className="">
                    <th className="py-1  bg-sand font-light text-sm">{translation.totalIncome}</th>
                    <th className="py-1  bg-sand font-light text-sm">{translation.totalExpenses}</th>
                    <th className="py-1  bg-sand font-light text-sm">{translation.endingBalance}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="">
                    <td className="py-1  bg-sand font-light text-sm text-center">
                      {totalAmount}.- {selectedCurrency}
                    </td>
                    <td className="py-1  bg-sand font-light text-sm text-center">
                      {totalExpenses}.- {selectedCurrency}
                    </td>
                    <td className="py-1  bg-sand font-light text-sm text-center">
                      {totalAmount - totalExpenses}.- {selectedCurrency}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-between">
            <button className="bg-blue text-white m-2 px-2 py-1 rounded-md hover:bg-darkgrey transition duration-300" onClick={handleAddToTableData}>
              Save
            </button>
            <button className=" bg-blue text-white m-2 border cursor-pointer px-2 py-1 rounded-md hover:bg-darkgrey transition duration-300" onClick={handleNewSite}>
              New Site
            </button>

            {/* <div className="flex justify-end">
              <button
                className="mx-2 border cursor-pointer"
                onClick={handlePrint}
              >
                Print
              </button>
              <button
                className="mx-2 border cursor-pointer"
                onClick={handleNewSite}
              >
                New Site
              </button>
            </div> */}
          </div>
        </>
      )}
    </div>
  );
}
