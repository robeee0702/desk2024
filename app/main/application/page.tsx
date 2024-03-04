'use client'
import { useState } from "react";


export default function Page() {

  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [createdBy, setCreatedBy] = useState('');



  const handleSubmit = (e) => {
    e.preventDefault();
    // Itt lesz majd a data collector logika
  };



  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Product Data Collector</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-600">
            Name:
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="barcode" className="block text-sm font-medium text-gray-600">
            Barcode:
          </label>
          <input
            type="text"
            id="barcode"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="selectedCategory" className="block text-sm font-medium text-gray-600">
            Category:
          </label>
          <input
            type="text"
            id="selectedCategory"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter product category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="brand" className="block text-sm font-medium text-gray-600">
            Brand:
          </label>
          <input
            type="text"
            id="brand"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter product brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium text-gray-600">
            Price:
          </label>
          <input
            type="number"
            id="price"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter product price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-600">
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter product quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="createdBy" className="block text-sm font-medium text-gray-600">
            Created By:
          </label>
          <input
            type="text"
            id="createdBy"
            className="mt-1 p-2 w-full border rounded-md"
            placeholder="Enter creator's name"
            value={createdBy}
            onChange={(e) => setCreatedBy(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center justify-between mt-8">
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

