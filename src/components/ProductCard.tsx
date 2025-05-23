import React from 'react'
import type { Product } from '@/types/product'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="border rounded-lg shadow p-4 flex flex-col items-center w-60 bg-white">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-32 h-32 object-cover mb-2 rounded"
        />
      )}
      <div className="font-semibold text-lg mb-1 text-center text-gray-800">{product.name}</div>
      <div className="text-blue-600 font-bold mb-1">${product.price.toFixed(2)}</div>
      <div className="text-xs text-gray-700 text-center line-clamp-2">{product.description}</div>
    </div>
  )
} 