"use client";
import Search from "@/app/components/Search";
import { database } from "@/firebase";
import { useClerk } from "@clerk/nextjs";
import { onValue, ref, remove, set } from "firebase/database";
import { useEffect, useState } from "react";

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

export default function Page() {
  const { user } = useClerk();
  const [partners, setPartners] = useState<Partners[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIndexes, setFilteredIndexes] = useState<number[]>([]);

  useEffect(() => {
    const indexes: number[] = [];
    partners.forEach((partner, index) => {
      if (Object.values(partner).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase()))) {
        indexes.push(index);
      }
    });
    setFilteredIndexes(indexes);
  }, [partners, searchTerm]);

  const [formData, setFormData] = useState<Partners>({
    partnerName: "",
    vatNumber: "",
    euVatNumber: "",
    groupVatNumber: "",
    postalCode: "",
    city: "",
    country: "",
    address: "",
    addressType: "",
    houseNumber: "",
    deliveryPostalCode: "",
    deliveryCity: "",
    deliveryAddress: "",
    deliveryHouseNumber: "",
    emailAddress: "",
    phoneNumber: "",
    paymentMethod: "",
    partnerType: "",
  });
  const [editingPartnerIndex, setEditingPartnerIndex] = useState<number | null>(null);
  const [editingPartner, setEditingPartner] = useState<Partners | null>(null);
  const [editingPartnerData, setEditingPartnerData] = useState({
    partnerName: "",
    vatNumber: "",
    euVatNumber: "",
    groupVatNumber: "",
    postalCode: "",
    city: "",
    country: "",
    address: "",
    addressType: "",
    houseNumber: "",
    deliveryPostalCode: "",
    deliveryCity: "",
    deliveryAddress: "",
    deliveryHouseNumber: "",
    emailAddress: "",
    phoneNumber: "",
    paymentMethod: "",
    partnerType: "",
  });

  const addDataToList = (data: Partners) => {
    setPartners([...partners, data]);
  };

  // Partner adatok lekérése
  useEffect(() => {
    if (user) {
      // Termékek lekérése az adott alkategóriából
      const productsRef = ref(database, `/users/data/${user.id}/partners`);

      onValue(productsRef, (snapshot) => {
        const data = snapshot.val();

        if (data) {
          // Az adatokból egy tömb létrehozása
          const partnersArray: Partners[] = [];
          Object.entries(data).forEach(([productId, partner]: [string, Partners]) => {
            partnersArray.push({
              ...partner,
            });
          });

          // Állapot frissítése
          setPartners(partnersArray);
        }
      });
    }
  }, [user]);

  // Űrlap kezelése
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingPartner) {
      setEditingPartner({
        ...editingPartner,
        [e.target.name]: e.target.value,
      });
      // Frissítsd az editingProductData-t is, hogy megjelenjenek az aktuális adatok
      setEditingPartner((prevData) => ({
        ...prevData,
        [e.target.name]: e.target.value,
      }));
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.partnerName && formData.emailAddress) {
      const dataWithCategories = {
        ...formData,
      };

      addDataToList(dataWithCategories);
      // Töröljük az űrlap tartalmát
      setFormData({
        partnerName: "",
        vatNumber: "",
        euVatNumber: "",
        groupVatNumber: "",
        postalCode: "",
        city: "",
        country: "",
        address: "",
        addressType: "",
        houseNumber: "",
        deliveryPostalCode: "",
        deliveryCity: "",
        deliveryAddress: "",
        deliveryHouseNumber: "",
        emailAddress: "",
        phoneNumber: "",
        paymentMethod: "",
        partnerType: "",
      });
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Törlés
  const handleDelete = async (index: number) => {
    const partnerToDelete = partners[index];

    if (user && user.id && partnerToDelete) {
      try {
        const productRefToDelete = ref(database, `/users/data/${user.id}/partners/${partnerToDelete.vatNumber}`);

        await remove(productRefToDelete);

        console.log("Product deleted successfully.");

        setPartners((prevPartners) => prevPartners.filter((partner) => partner.vatNumber !== partnerToDelete.vatNumber));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    } else {
      console.log("A feltétel nem teljesült!");
    }
  };

  //Up-to-date metódusok
  const handleEdit = (index: number) => {
    setEditingPartnerIndex(index);
    setEditingPartner(partners[index]);
    // Állítsd be az aktuális termék adatait az editingProductData állapotba
    setEditingPartnerData({
      partnerName: partners[index].partnerName,
      partnerType: partners[index].partnerType,
      vatNumber: partners[index].vatNumber,
      euVatNumber: partners[index].euVatNumber,
      groupVatNumber: partners[index].groupVatNumber,
      postalCode: partners[index].postalCode,
      city: partners[index].city,
      country: partners[index].country,
      address: partners[index].address,
      addressType: partners[index].addressType,
      houseNumber: partners[index].houseNumber,
      deliveryPostalCode: partners[index].deliveryPostalCode,
      deliveryCity: partners[index].deliveryCity,
      deliveryAddress: partners[index].deliveryAddress,
      deliveryHouseNumber: partners[index].deliveryHouseNumber,
      emailAddress: partners[index].emailAddress,
      phoneNumber: partners[index].phoneNumber,
      paymentMethod: partners[index].paymentMethod,
    });
  };

  const handleSave = async () => {
    if (user && user.id && editingPartnerIndex !== null) {
      const productToUpdate = partners[editingPartnerIndex];

      const partnerRef = ref(database, `/users/data/${user.id}/partners/${productToUpdate.vatNumber}`);

      try {
        const updatedPartnersData = {
          ...editingPartnerData,
        };

        await set(partnerRef, updatedPartnersData);

        setPartners((prevProducts) => {
          const updatedPartners = [...prevProducts];
          updatedPartners[editingPartnerIndex] = {
            ...updatedPartners[editingPartnerIndex],
            ...updatedPartnersData,
          };
          return updatedPartners;
        });

        setEditingPartner(null);
        setEditingPartnerIndex(null);
      } catch (error) {
        console.error("Error updating product:", error);
      }
    }
  };

  return (
    <div className=" text-black w-full">
      <div className="overflow-x-auto lg:mx-auto mt-6 p-2 lg:p-8">
        <h1 className="flex justify-center text-black font-bold text-2xl mb-6">PARTNER LIST</h1>
        <div className="m-4">
          <Search search={"Keresés.."} onChange={handleSearch} />
        </div>
        <table className="w-full text-xs text-left rtl:text-right text-black56 mt-8">
          <thead>
            <tr className="border-b-2 border-darkgrey">
              {partners.some((partner) => partner.partnerName) && <th className="px-1 py-1  text-center  dark:bg-grey">Partner name</th>}
              {partners.some((partner) => partner.partnerType) && <th className="px-1 py-1 text-center  dark:bg-grey">Partner type</th>}
              {partners.some((partner) => partner.address) && <th className="px-1 py-1 text-center  dark:bg-grey">Address</th>}
              {partners.some((partner) => partner.address) && <th className="px-1 py-1 text-center  dark:bg-grey">Delivery Address</th>}
              {partners.some((partner) => partner.vatNumber) && <th className="px-1 py-1 text-center  dark:bg-grey">VAT </th>}
              {partners.some((partner) => partner.groupVatNumber) && <th className="px-1 py-1 text-center  dark:bg-grey">Group VAT</th>}
              {partners.some((partner) => partner.euVatNumber) && <th className="px-1 py-1 text-center  dark:bg-grey">EU VAT</th>}
              {partners.some((partner) => partner.emailAddress) && <th className="px-1 py-1 text-center  dark:bg-grey">Email address</th>}
              {partners.some((partner) => partner.phoneNumber) && <th className="px-1 py-1 text-center  dark:bg-grey">Phone number</th>}
              {partners.some((partner) => partner.paymentMethod) && <th className="px-1 py-1 text-center  dark:bg-grey">Payment method</th>}
              <th className="px-1 py-1 text-center dark:bg-grey">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIndexes.map((index) => {
              const partner = partners[index];
              return (
                <tr key={partner.vatNumber} className={`bg-white  dark:bg-grey border-darkgrey hover:bg-grey dark:hover:bg-darkgrey`}>
                  <td className="px-2 py-3  italic font-bold text-center w-28 md:w-28 lg:w-36 xl:w-40">
                    {editingPartnerIndex === index ? (
                      <input
                        type="text"
                        name="partnerName"
                        className="p-1"
                        value={editingPartnerData.partnerName}
                        placeholder={editingPartner?.partnerName.toString()}
                        onChange={(e) =>
                          setEditingPartner((prevData) => ({
                            ...prevData,
                            partnerName: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      partner.partnerName
                    )}
                  </td>
                  {partners.some((partner) => partner.partnerType) && (
                    <td className="px-1 py-3 italic  text-center w-28 md:w-28 lg:w-36 xl:w-40">
                      {editingPartnerIndex === index ? (
                        <input
                          type="text"
                          name="partnerType"
                          placeholder={editingPartner?.partnerType}
                          className="p-1"
                          value={editingPartnerData.partnerType}
                          onChange={(e) =>
                            setEditingPartnerData((prevData) => ({
                              ...prevData,
                              partnerType: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        partner.partnerType
                      )}
                    </td>
                  )}
                  {partners.some((partner) => partner.address) && (
                    <td className="px-1 py-3 italic text-center w-32 md:w-32 lg:w-48 xl:w-60">
                      {editingPartnerIndex === index ? (
                        <div>
                          <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            className="p-1"
                            value={editingPartnerData.country}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                country: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            name="postalCode"
                            placeholder="Postal Code"
                            className="p-1"
                            value={editingPartnerData.postalCode}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                postalCode: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            name="city"
                            placeholder="City"
                            className="p-1"
                            value={editingPartnerData.city}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                city: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            className="p-1"
                            value={editingPartnerData.address}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                address: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            name="addressType"
                            placeholder="Address Type"
                            className="p-1"
                            value={editingPartnerData.addressType}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                addressType: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            name="houseNumber"
                            placeholder="House Number"
                            className="p-1"
                            value={editingPartnerData.houseNumber}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                houseNumber: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <span>{`${partner.country} - ${partner.postalCode} ${partner.city}, ${partner.address} ${partner.addressType} ${partner.houseNumber}`}</span>
                      )}
                    </td>
                  )}
                  {partners.some((partner) => partner.address) && (
                    <td className="px-1 py-3 italic text-center w-32 md:w-32 lg:w-48 xl:w-60">
                      {editingPartnerIndex === index ? (
                        <div>
                          <input
                            type="text"
                            name="deliveryPostalCode"
                            placeholder="Postal Code"
                            className="p-1"
                            value={editingPartnerData.deliveryPostalCode}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                deliveryPostalCode: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            name="deliveryCity"
                            placeholder="City"
                            className="p-1"
                            value={editingPartnerData.deliveryCity}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                deliveryCity: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            name="deliveryAddress"
                            placeholder="Address"
                            className="p-1"
                            value={editingPartnerData.deliveryAddress}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                deliveryAddress: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            name="addressType"
                            placeholder="Address Type"
                            className="p-1"
                            value={editingPartnerData.addressType}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                addressType: e.target.value,
                              }))
                            }
                          />
                          <input
                            type="text"
                            name="deliveryHouseNumber"
                            placeholder="House Number"
                            className="p-1"
                            value={editingPartnerData.deliveryHouseNumber}
                            onChange={(e) =>
                              setEditingPartnerData((prevData) => ({
                                ...prevData,
                                deliveryHouseNumber: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <span>{`${partner.deliveryPostalCode} ${partner.deliveryCity}, ${partner.deliveryAddress} ${partner.addressType} ${partner.deliveryHouseNumber}`}</span>
                      )}
                    </td>
                  )}
                  {partners.some((partner) => partner.vatNumber) && (
                    <td className="px-2 py-3 italic  text-center">
                      {editingPartnerIndex === index ? (
                        <input
                          type="text"
                          name="productType"
                          placeholder={editingPartner?.vatNumber}
                          className="w-10 md:w-12 lg:w-14 xl:w-20 p-1"
                          value={editingPartnerData.vatNumber}
                          onChange={(e) =>
                            setEditingPartnerData((prevData) => ({
                              ...prevData,
                              vatNumber: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        partner.vatNumber
                      )}
                    </td>
                  )}
                  {partners.some((partner) => partner.groupVatNumber) && (
                    <td className="px-1 py-3 italic  text-center">
                      {editingPartnerIndex === index ? (
                        <input
                          type="text"
                          name="productType"
                          placeholder={editingPartner?.groupVatNumber}
                          className="w-10 md:w-12 lg:w-14 xl:w-20 p-1"
                          value={editingPartnerData.groupVatNumber}
                          onChange={(e) =>
                            setEditingPartnerData((prevData) => ({
                              ...prevData,
                              groupVatNumber: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        partner.groupVatNumber
                      )}
                    </td>
                  )}
                  {partners.some((partner) => partner.euVatNumber) && (
                    <td className="px-1 py-3 italic  text-center">
                      {editingPartnerIndex === index ? (
                        <input
                          type="text"
                          name="productType"
                          placeholder={editingPartner?.euVatNumber}
                          className="w-10 md:w-12 lg:w-14 xl:w-20 p-1"
                          value={editingPartnerData.euVatNumber}
                          onChange={(e) =>
                            setEditingPartnerData((prevData) => ({
                              ...prevData,
                              euVatNumber: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        partner.euVatNumber
                      )}
                    </td>
                  )}
                  {partners.some((partner) => partner.emailAddress) && (
                    <td className="px-1 py-3 italic  text-center">
                      {editingPartnerIndex === index ? (
                        <input
                          type="text"
                          name="productType"
                          placeholder={editingPartner?.emailAddress}
                          className="w-10 md:w-12 lg:w-14 xl:w-20 p-1"
                          value={editingPartnerData.emailAddress}
                          onChange={(e) =>
                            setEditingPartnerData((prevData) => ({
                              ...prevData,
                              emailAddress: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        partner.emailAddress
                      )}
                    </td>
                  )}
                  {partners.some((partner) => partner.phoneNumber) && (
                    <td className="px-1 py-3 italic  text-center">
                      {editingPartnerIndex === index ? (
                        <input
                          type="text"
                          name="productType"
                          placeholder={editingPartner?.phoneNumber}
                          className="w-10 md:w-12 lg:w-14 xl:w-20 p-1"
                          value={editingPartnerData.phoneNumber}
                          onChange={(e) =>
                            setEditingPartnerData((prevData) => ({
                              ...prevData,
                              phoneNumber: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        partner.phoneNumber
                      )}
                    </td>
                  )}
                  {partners.some((partner) => partner.paymentMethod) && (
                    <td className="px-1 py-3 italic  text-center">
                      {editingPartnerIndex === index ? (
                        <input
                          type="text"
                          name="productType"
                          placeholder={editingPartner?.paymentMethod}
                          className="w-10 md:w-12 lg:w-14 xl:w-20 p-1"
                          value={editingPartnerData.paymentMethod}
                          onChange={(e) =>
                            setEditingPartnerData((prevData) => ({
                              ...prevData,
                              paymentMethod: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        partner.paymentMethod
                      )}
                    </td>
                  )}
                  <td className="flex justify-center p-2">
                    {editingPartnerIndex === index ? (
                      <button className="bg-green text-white p-1 rounded-md mr-1 hover:opacity-70" onClick={handleSave}>
                        Save
                      </button>
                    ) : (
                      <button className="bg-blue text-black font-bold  p-1 px-3 rounded-md mr-1 hover:opacity-70" onClick={() => handleEdit(index)}>
                        Edit
                      </button>
                    )}
                    <button className="bg-red opacity-90 text-black font-bold  p-1 rounded-md mr-1 hover:opacity-70" onClick={() => handleDelete(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
