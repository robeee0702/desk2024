"use client";
import { currentUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { get, push, ref, set } from "firebase/database";
import { database } from "@/firebase";
import { useRouter } from "next/navigation";
import { getLanguage } from "@/app/constants/index";

const translations = {
  en: {
    partnerList: "PARTNER LIST",
    partnerName: "Partner name",
    fullAddress: "Full address",
    vatNumber: "VAT ",
    euVatNumber: "EU VAT ",
    groupVatNumber: "Group VAT ",
    postalCode: "Postal code",
    country: "Country",
    city: "City",
    address: "Address",
    addressType: "Address type",
    houseNumber: "Housenr./Fl./Door",
    deliveryPostalCode: "Delivery Postal code",
    deliveryCity: "Delivery city",
    deliveryAddress: "Delivery address",
    deliveryHouseNumber: "Delivery House number/Floor/Door",
    emailAddress: "Email",
    phoneNumber: "Phone number",
    paymentMethod: " Payment method",
    contactPerson: "Contact person",
    partnerType: "Partner type",
    save: "Save",
  },
  de: {
    partnerList: "PARTNER LIST",
    partnerName: "Partner név",
    fullAddress: "Teljes cím",
    vatNumber: "VAT ",
    euVatNumber: "EU VAT ",
    groupVatNumber: "Group VAT ",
    postalCode: "PLZ",
    country: "Land",
    city: "Stadt",
    address: "Straße",
    addressType: "Straßentyp",
    houseNumber: "Hausenr./Stock/Tür",
    deliveryPostalCode: "Lieferanten PLZ",
    deliveryCity: "Lieferstadt",
    deliveryAddress: "Lieferadresse",
    deliveryHouseNumber: "Lieferhausenummer/Stock/Tür",
    emailAddress: "Email",
    phoneNumber: "Handynummer",
    paymentMethod: "Auszahlungsmethod",
    contactPerson: "Ansprechpartner",
    partnerType: "Partner Typ",
    save: "Speichern",
  },
  hu: {
    partnerList: "PARTNER LISTA",
    partnerName: "Partner név",
    fullAddress: "Teljes cím",
    vatNumber: "VAT ",
    euVatNumber: "EU VAT ",
    groupVatNumber: "Group VAT ",
    postalCode: "Irányítószám",
    country: "Ország",
    city: "Város",
    address: "Utca",
    addressType: "Utcatípus",
    houseNumber: "Házszám/Em./Ajtó",
    deliveryPostalCode: "Szállítói irányítószám",
    deliveryCity: "Szállítói város",
    deliveryAddress: "Szállítói utca",
    deliveryHouseNumber: "Szállítói Házszám/Em./Ajtó",
    emailAddress: "Email",
    phoneNumber: "Telefonszám",
    paymentMethod: "Fizetési metódus",
    contactPerson: "Kontakt személy",
    partnerType: "Partner típus",
    save: "Mentés",
  },
};

export default function Page() {
  const { user } = useClerk();
  const router = useRouter();
  const [partners, setPartners] = useState({
    partnerName: "",
    vatNumber: 0,
    euVatNumber: "",
    groupVatNumber: "",
    postalCode: "",
    country: "",
    city: "",
    address: "",
    addressType: "",
    houseNumber: "",

    deliveryPostalCode: "",
    deliveryCity: "",
    deliveryAddress: "",
    deliveryHouseNumber: "",
    emailAddress: "",
    phoneNumber: "",
    paymentMethod: "transfer",
    partnerType: "customer",
  });
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

  const handlePartnerChange = (e) => {
    const { id, value } = e.target;
    setPartners((prevData) => ({ ...prevData, [id]: value }));
  };

  const handlePaymentMethodChange = (e) => {
    const { value } = e.target;
    setPartners((prevData) => ({ ...prevData, paymentMethod: value }));
  };
  const handlePartnerTypeChange = (e) => {
    const { value } = e.target;
    setPartners((prevData) => ({ ...prevData, partnerType: value }));
  };

  const handleAddToData = async () => {
    if (
      !user ||
      !user.id ||
      !partners.partnerName ||
      !partners.city ||
      !partners.address ||
      !partners.vatNumber ||
      !partners.houseNumber ||
      !partners.paymentMethod
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

    // Referencia útvonal product
    const partnersDataRef = ref(
      database,
      `users/data/${user.id}/partners/${partners.vatNumber}`
    );

    // Az adatok frissítése a referenciában
    await set(partnersDataRef, {
      partnerName: partners.partnerName,
      vatNumber: partners.vatNumber,
      euVatNumber: partners.euVatNumber,
      groupVatNumber: partners.groupVatNumber,
      postalCode: partners.postalCode,
      city: partners.city,
      country: partners.country,
      address: partners.address,
      addressType: partners.addressType,
      houseNumber: partners.houseNumber,
      deliveryPostalCode: partners.deliveryPostalCode,
      deliveryCity: partners.deliveryCity,
      deliveryAddress: partners.deliveryAddress,
      deliveryHouseNumber: partners.deliveryHouseNumber,
      emailAddress: partners.emailAddress,
      phoneNumber: partners.phoneNumber,
      paymentMethod: partners.paymentMethod,
      partnerType: partners.partnerType,
    });

    router.push("/main/customers/list");
  };

  return (
    <div className="w-full text-black m-3 md:m-4">
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
            <h1 className="flex justify-center text-black72 font-bold text-2xl mb-6">
              {translation.partnerList}
            </h1>
            <div className="grid grid-cols-1">
              <label
                htmlFor="partnerName"
                className="block text-lg font-bold text-black56"
              >
                {translation.partnerName}
              </label>
              <input
                type="text"
                id="partnerName"
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none focus:ring  focus:border-blue"
                placeholder={translation.partnerName}
                value={partners.partnerName}
                onChange={handlePartnerChange}
              />
              <div className="border-t mt-4 w-full"></div>

              <div className=" flex flex-col items-center m-2 p-3 rounded-md  text-black72">
                <p>{`${partners.partnerName}`}</p>
                <p>{`${partners.address} ${partners.addressType}  ${partners.houseNumber}. `}</p>
                <p>{`${partners.city} , ${partners.postalCode} `}</p>
                <p>{`${partners.country} `}</p>
              </div>
              <div className="border-t mb-4 w-full"></div>
            </div>

            {/* 1. táblázat*/}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <div className="w-full max-w-20em flex flex-col relative mix-blend-lighten"></div>
                <label
                  htmlFor="postalCode"
                  className="block text-lg font-bold  text-black56"
                >
                  {translation.postalCode}
                </label>
                <input
                  type="text"
                  id="postalCode"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-green"
                  placeholder={translation.postalCode}
                  value={partners.postalCode}
                  onChange={handlePartnerChange}
                />
                <label
                  htmlFor="houseNumber"
                  className="block text-lg font-bold  text-black56"
                >
                  {translation.houseNumber}
                </label>
                <input
                  type="text"
                  id="houseNumber"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.houseNumber}
                  value={partners.houseNumber}
                  onChange={handlePartnerChange}
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
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.vatNumber}
                  value={partners.vatNumber}
                  onChange={handlePartnerChange}
                />
                <label
                  htmlFor="emailAddress"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.emailAddress}
                </label>
                <input
                  type="text"
                  id="emailAddress"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.emailAddress}
                  value={partners.emailAddress}
                  onChange={handlePartnerChange}
                />
              </div>
              {/*  2. táblázat */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.city}
                </label>
                <input
                  type="text"
                  id="city"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.city}
                  value={partners.city}
                  onChange={handlePartnerChange}
                />

                <label
                  htmlFor="euVatNumber"
                  className="block text-lg font-bold  text-black56"
                >
                  {translation.euVatNumber}
                </label>
                <input
                  type="text"
                  id="euVatNumber"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.euVatNumber}
                  value={partners.euVatNumber}
                  onChange={handlePartnerChange}
                />
                <label
                  htmlFor="phoneNumber"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.phoneNumber}
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.phoneNumber}
                  value={partners.phoneNumber}
                  onChange={handlePartnerChange}
                />
              </div>
              {/*  3. táblázat */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.address}
                </label>
                <input
                  type="text"
                  id="address"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.address}
                  value={partners.address}
                  onChange={handlePartnerChange}
                />

                <label
                  htmlFor="groupVatNumber"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.groupVatNumber}
                </label>
                <input
                  type="text"
                  id="groupVatNumber"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.groupVatNumber}
                  value={partners.groupVatNumber}
                  onChange={handlePartnerChange}
                />
              </div>
              {/* 4. táblázat */}
              <div>
                <label
                  htmlFor="addressType"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.addressType}
                </label>
                <input
                  type="text"
                  id="addressType"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.addressType}
                  value={partners.addressType}
                  onChange={handlePartnerChange}
                />
                <label
                  htmlFor="country"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.country}
                </label>
                <input
                  type="text"
                  id="country"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                  placeholder={translation.country}
                  value={partners.country}
                  onChange={handlePartnerChange}
                />
                <label
                  htmlFor="paymentMethod"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.paymentMethod}
                </label>
                <select
                  id="paymentMethod"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
                  onChange={handlePaymentMethodChange}
                  value={partners.paymentMethod}
                >
                  <option value="transfer">Bank transfer</option>
                  <option value="cash">Cash</option>
                </select>

                <label
                  htmlFor="partnerType"
                  className="block text-lg font-bold text-black56"
                >
                  {translation.partnerType}
                </label>
                <select
                  id="partnerType"
                  className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
                  onChange={handlePartnerTypeChange}
                  value={partners.partnerType}
                >
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-center mt-12">
              <button
                type="button"
                className="bg-blue text-white p-2 lg:px-96 rounded-md hover:bg-darkgrey transition duration-300"
                onClick={handleAddToData}
              >
                {translation.save}
              </button>
            </div>
          </div>
          <div className="w-full mx-auto p-2 lg:p-12 bg-white text-darkgrey rounded-md shadow-md"></div>
        </section>
      )}
    </div>
  );
}
