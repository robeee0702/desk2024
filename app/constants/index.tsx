import { IoMdCube } from "react-icons/io";
import { FaHome } from "react-icons/fa";
import { IoMdPerson } from "react-icons/io";
import { BsPeopleFill } from "react-icons/bs";
import { GrDocumentText } from "react-icons/gr";
import { IoAppsOutline } from "react-icons/io5";



const translations = {
  en: {
    category: 'Category',
    productName: 'Product name',
    quantity: 'Quantity',
    purchasePrice: 'Purchase Price',
    artNumber: 'Art number',
    units: 'Units (pc/kg/meter/etc..)',
    salesPrice: 'Sales Price',
    save: 'Save',
  },
  de: {
    category: 'Kategorie',
    productName: 'Produktname',
    quantity: 'Menge',
    purchasePrice: 'Einkaufspreis',
    artNumber: 'Artikelnummer',
    units: 'Einheiten (Stk/kg/meter/etc..)',
    salesPrice: 'Verkaufspreis',
    save: 'Speichern',
  },
  hu: {
    category: 'Kategória',
    productName: 'Produktum',
    quantity: 'Mennyiség',
    purchasePrice: 'Beszerzési ár',
    artNumber: 'Cikkszám',
    units: 'Egység(Stk/kg/meter/etc..)',
    salesPrice: 'Eladási ár',
    save: 'Mentés',
  },
};


export function getLanguage(): string {
  if (typeof window !== 'undefined') {
    // Böngésző környezet
    const preferredLanguages = navigator.languages || [navigator.language || 'en'];
    const mainLanguage = preferredLanguages.map(lang => lang.split('-')[0]).find(lang => translations[lang]);
    return mainLanguage || 'en';
  } else {
    // Szerver oldali környezet
    return 'en'; // Vagy a szerver oldali alapértelmezett nyelv
  }
}

export const sidebarLinks = [
    {
      imgURL: FaHome,
      route: "/main",
      label: "Home",
    },
    {
      imgURL: IoMdPerson,
      route: "/main/my-profile",
      label: "My Profile",
    },
    {
      imgURL: IoMdCube,
      label: "Products & Stock",
      submenu: true,
      submenuItems: [
        {
          imgURL: GrDocumentText,
          route: "/main/products-and-stock/add",
          label: "Add new Product",
        },
        {
          imgURL: GrDocumentText,
          route: "/main/products-and-stock/list",
          label: "Product List",
        },
        {
          imgURL: GrDocumentText,
          route: "/main/products-and-stock/inventory",
          label: "Search by Category",
        },
      ]
    },
    {
      imgURL: BsPeopleFill,
      label: "Customers & Partners",
      submenu: true,
      submenuItems: [
        {
          imgURL: GrDocumentText,
          route: "/main/customers/add",
          label: "Add new partners",
        },
        {
          imgURL: GrDocumentText,
          route: "/main/customers/list",
          label: "Partners List",
        },
      ],
    },
    // {
    //   imgURL: GrDocumentText,
    //   route: "/main/invoice-payments",
    //   label: "Invoice & Payments",
    // },
    {
      imgURL: IoAppsOutline,
      label: "Application",
      submenu: true,
      submenuItems: [
        {
          imgURL: GrDocumentText,
          route: "/main/application/budget",
          label: "Budget Planner",
        },
        {
          imgURL: GrDocumentText,
          route: "/main/application/calendar",
          label: "Calendar",
        },
      ]
    },
   
  ];
  
