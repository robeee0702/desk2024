"use client";
import { currentUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { get, push, ref, set } from "firebase/database";
import { database } from "@/firebase";
import { useRouter } from "next/navigation";
import { MdEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import { TbWorldWww } from "react-icons/tb";
import { getLanguage } from "@/app/constants/index";

const translations = {
  en: {
    companyName: "Company name",
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
    ibanNumber: "IBAN",
    bankName: "Bank name",
    websiteURL: "Website",
    phoneNumber: "Phone number",
    email: "Email",
    save: "Save",
  },
  de: {
    companyName: "Unternehmensname",
    fullAddress: "Vollständige Adresse",
    vatNumber: "VAT ",
    euVatNumber: "EU VAT ",
    groupVatNumber: "Group VAT ",
    postalCode: "PLZ",
    country: "Land",
    city: "Stadt",
    address: "Straße",
    addressType: "Straßentyp",
    houseNumber: "Hausenr./Stock/Tür",
    ibanNumber: "IBAN",
    bankName: "Bank name",
    websiteURL: "Webseite",
    phoneNumber: "Handynummer",
    email: "Email",
    save: "Speichern",
  },
  hu: {
    companyName: "Cég név",
    fullAddress: "Teljes cím",
    vatNumber: "VAT ",
    euVatNumber: "EU VAT ",
    groupVatNumber: "Group VAT ",
    postalCode: "Irányítószám",
    country: "Ország",
    city: "Város",
    address: "Utca név",
    addressType: "Utca típus",
    houseNumber: "Házszám/Em./Ajtó",
    ibanNumber: "IBAN",
    bankName: "Bank neve",
    websiteURL: "Weboldal",
    phoneNumber: "Telefonszám",
    email: "Email",
    save: "Mentés",
  },
};

export default function Page() {
  const { user } = useClerk();
  const router = useRouter();
  const [profile, setProfile] = useState({
    companyName: "",
    vatNumber: "",
    euVatNumber: "",
    groupVatNumber: "",
    postalCode: "",
    country: "",
    city: "",
    address: "",
    addressType: "",
    houseNumber: "",
    houseFloor: "",
    houseDoor: "",
    ibanNumber: "",
    bankName: "",
    websiteURL: "",
    phoneNumber: "",
    email: "",
  });
  const [language, setLanguage] = useState<string>("en"); //Alapértelmezett angol
  const translation = translations[language];

  //Nyelv lekérése a globális környezetből
  useEffect(() => {
    const clientLanguage = getLanguage();
    setLanguage(clientLanguage);
  }, []);


  const handlePartnerChange = (e) => {
    const { id, value } = e.target;
    setProfile((prevData) => ({ ...prevData, [id]: value }));
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (user && user.id) {
        const profileDataRef = ref(
          database,
          `users/data/${user.id}/my-profile`
        );

        try {
          const snapshot = await get(profileDataRef);
          const data = snapshot.val();

          if (data) {
            // Betöltjük az adatokat a profil és input mezőkbe
            setProfile(data);
          }
        } catch (error) {
          console.error("Error loading profile data:", error);
        }
      }
    };

    loadProfileData();
  }, [user]);

  const handleAddToData = async () => {
    if (
      !user ||
      !user.id ||
      !profile.city ||
      !profile.address ||
      !profile.houseNumber
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

    // Referencia útvonal profile
    const profileDataRef = ref(database, `users/data/${user.id}/my-profile`);

    // Az adatok frissítése a referenciában
    await set(profileDataRef, {
      companyName: profile.companyName || "",
      vatNumber: profile.vatNumber || "",
      euVatNumber: profile.euVatNumber || "",
      groupVatNumber: profile.groupVatNumber || "",
      postalCode: profile.postalCode || "",
      city: profile.city || "",
      address: profile.address || "",
      addressType: profile.addressType || "",
      houseNumber: profile.houseNumber || "",
      houseFloor: profile.houseFloor || "",
      houseDoor: profile.houseDoor || "",
      ibanNumber: profile.ibanNumber || "",
      bankName: profile.bankName || "",
      websiteURL: profile.websiteURL || "",
      phoneNumber: profile.phoneNumber || "",
      email: profile.email || "",
    });

    router.push("/main");
    window.location.reload();
  };

  const handleIbanChange = (event) => {
    const { name, value } = event.target;
    const formattedValue = formatIbanNumber(value);
    setProfile((prevData) => ({
      ...prevData,
      ibanNumber: formattedValue,
      [name]: formattedValue,
    }));
  };

  const formatIbanNumber = (value) => {
    const formattedValue = value.replace(/-/g, "");

    // Most pedig hozzáadhatjuk a kötőjeleket, minden 4. karakter után
    let result = "";
    for (let i = 0; i < formattedValue.length; i++) {
      result += formattedValue[i];
      if ((i + 1) % 4 === 0 && i + 1 !== formattedValue.length) {
        result += "-";
      }
    }

    return result;
  };

 

  return (
    <div className="w-full text-black m-3 md:m-4">
      <section className="">
        <div className="w-full mx-auto p-2 lg:p-12 bg-white text-darkgrey rounded-md shadow-md">
          <h1 className="flex justify-center text-black font-bold text-2xl mb-6">
            MY PROFILE
          </h1>
          <div className="grid grid-cols-1">
            {/* Logo a saját profilba */}
            <img src="" alt="" />
            <div className="border-t mt-4 w-full"></div>

            <div className="m-2 w-60 p-3 rounded-md text-black72 text-lg">
              <p>{profile.companyName ? `${profile.companyName}` : ""}</p>
              <p>{`${profile.address || ""} ${profile.addressType || ""}  ${
                profile.houseNumber || ""
              }. ${profile.houseFloor || ""} ${profile.houseDoor || ""}`}</p>
              <p>{`${profile.postalCode || ""}, ${profile.city || ""}`}</p>
              <p>{`${profile.country || ""}`}</p>
              <div className="flex flex-col md:flex-row text-lg">
                <div className="flex items-center text-black ">
                  <MdEmail size={21} />
                </div>
                <div className="flex items-center m-2">
                  <p>{`${profile.email || ""}`}</p>
                </div>
                <div className="flex items-center text-black">
                  <FaPhone size={18} />
                </div>
                <div className="flex items-center m-2">
                  <p>{`${profile.phoneNumber || ""}`}</p>
                </div>
                <div className="flex items-center text-black">
                  <TbWorldWww size={18} />
                </div>
                <div className="flex items-center m-2">
                  <a href={`mailto:${profile.websiteURL}`}>
                    <p>{`${profile.websiteURL || ""}`}</p>
                  </a>
                </div>
              </div>
            </div>
            <div className="border-t mb-4 w-full"></div>
          </div>
          <label
            htmlFor="companyName"
            className="block text-lg font-bold text-black56"
          >
            {translation.companyName}
          </label>
          <input
            type="text"
            id="companyName"
            className="my-5 w-full p-2 rounded-md bg-grey text-blue border-black focus:outline-none border border-l-black focus:ring  focus:border-blue"
            placeholder={
              profile.companyName
                ? `${profile.companyName}`
                : translation.companyName
            }
            value={profile.companyName || ""}
            onChange={handlePartnerChange}
          />
          {/* 1. táblázat*/}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <div className="w-full max-w-20em flex flex-col relative mix-blend-lighten"></div>
              <label
                htmlFor="postalCode"
                className="block text-lg font-bold text-black56"
              >
                {translation.postalCode}
              </label>
              <input
                type="text"
                id="postalCode"
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-green"
                placeholder={
                  profile.postalCode
                    ? `${profile.postalCode}`
                    : translation.postalCode
                }
                value={profile.postalCode || ""}
                onChange={handlePartnerChange}
              />
              <label
                htmlFor="houseNumber"
                className="block text-lg font-bold text-black56"
              >
                {translation.houseNumber}
              </label>
              <input
                type="text"
                id="houseNumber"
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
                placeholder={
                  profile.houseNumber
                    ? `${profile.houseNumber}`
                    : translation.houseNumber
                }
                value={profile.houseNumber || ""}
                onChange={handlePartnerChange}
              />
              <label
                htmlFor="vatNumber"
                className="block text-lg font-bold text-black56"
              >
                {translation.vatNumber}
              </label>
              <input
                type="text"
                id="vatNumber"
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
                placeholder={
                  profile.vatNumber
                    ? `${profile.vatNumber}`
                    : translation.vatNumber
                }
                value={profile.vatNumber || ""}
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
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
                placeholder={
                  profile.city ? `${profile.city}` : translation.city
                }
                value={profile.city || ""}
                onChange={handlePartnerChange}
              />

              <label
                htmlFor="euVatNumber"
                className="block text-lg font-bold text-black56"
              >
                {translation.euVatNumber}
              </label>
              <input
                type="text"
                id="euVatNumber"
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue  focus:outline-none border border-black focus:ring focus:border-blue"
                placeholder={translation.euVatNumber}
                value={profile.euVatNumber || ""}
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
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
                placeholder={
                  profile.address ? `${profile.address}` : translation.address
                }
                value={profile.address || ""}
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
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
                placeholder={
                  profile.groupVatNumber
                    ? `${profile.groupVatNumber}`
                    : translation.groupVatNumber
                }
                value={profile.groupVatNumber || ""}
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
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
                placeholder={
                  profile.addressType
                    ? `${profile.addressType}`
                    : translation.addressType
                }
                value={profile.addressType || ""}
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
                className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
                placeholder={
                  profile.country ? `${profile.country}` : translation.country
                }
                value={profile.country || ""}
                onChange={handlePartnerChange}
              />
            </div>
          </div>
          {/* Táblázatok vége */}

          <label
            htmlFor="websiteURL"
            className="block text-lg font-bold text-black56"
          >
            {translation.websiteURL}
          </label>
          <input
            type="text"
            id="websiteURL"
            className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
            placeholder={
              profile.websiteURL
                ? `${profile.websiteURL}`
                : translation.websiteURL
            }
            value={profile.websiteURL || ""}
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
            className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
            placeholder={
              profile.phoneNumber
                ? `${profile.phoneNumber}`
                : translation.phoneNumber
            }
            value={profile.phoneNumber || ""}
            onChange={handlePartnerChange}
          />
          <label
            htmlFor="email"
            className="block text-lg font-bold text-black56"
          >
            {translation.email}
          </label>
          <input
            type="text"
            id="email"
            className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
            placeholder={profile.email ? `${profile.email}` : translation.email}
            value={profile.email || ""}
            onChange={handlePartnerChange}
          />
          <label
            htmlFor="bankName"
            className="block text-lg font-bold text-black56"
          >
            {translation.bankName}
          </label>
          <input
            type="text"
            id="bankName"
            className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
            placeholder={
              profile.bankName ? `${profile.bankName}` : translation.bankName
            }
            value={profile.bankName || ""}
            onChange={handlePartnerChange}
          />
          <label
            htmlFor="ibanNumber"
            className="block text-lg font-bold text-black56"
          >
            {translation.ibanNumber}
          </label>
          <input
            type="text"
            name="ibanNumber"
            className="mt-1 w-full p-2 rounded-md bg-grey text-blue focus:outline-none border border-black focus:ring focus:border-blue"
            placeholder={
              profile.ibanNumber
                ? `${profile.ibanNumber}`
                : translation.ibanNumber
            }
            value={profile.ibanNumber || ""}
            onChange={handleIbanChange}
          />
          <div className="flex items-center justify-center mt-4">
            <button
              type="button"
              className="bg-blue text-white mt-6 p-2 lg:px-80 rounded-md hover:bg-darkgrey transition duration-300"
              onClick={handleAddToData}
            >
              {translation.save}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
