import dotenv from 'dotenv'
dotenv.config()

import { supabase } from '../lib/supabase.js'

const seedProducts = [
  {
    name: "Acme Drawstring Bag",
    description: "Have you ever wondered just how exactly that drawstring bag works? Wonder no more!",
    price: 12.00,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80"
    ],
    category: "Accessories",
    in_stock: true
  },
  {
    name: "Acme Cup",
    description: "The perfect cup for your morning coffee or afternoon tea.",
    price: 15.00,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
    category: "Accessories",
    in_stock: true
  },
  {
    name: "Acme T-Shirt",
    description: "A comfortable and stylish t-shirt for everyday wear.",
    price: 25.00,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    category: "Clothing",
    in_stock: true
  },
  {
    name: "Acme Hoodie",
    description: "Stay warm and cozy with this premium hoodie.",
    price: 45.00,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    category: "Clothing",
    in_stock: true
  },
  {
    name: "Acme Sticker",
    description: "Show your support with this high-quality sticker.",
    price: 3.00,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&q=80",
    category: "Accessories",
    in_stock: true
  },
  {
    name: "Acme Notebook",
    description: "Perfect for jotting down ideas and notes.",
    price: 18.00,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    category: "Accessories",
    in_stock: true
  }
]

async function seedDatabase() {
  try {
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Error checking existing products:', checkError)
      throw checkError
    }

    if (existingProducts && existingProducts.length > 0) {
      console.log('Database already contains products. Skipping seed.')
      return
    }

    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .insert(seedProducts as any)
      .select()

    if (insertError) {
      throw insertError
    }

  } catch (error) {
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      process.exit(0)
    })
    .catch((error) => {
      process.exit(1)
    })
}

export { seedDatabase }

