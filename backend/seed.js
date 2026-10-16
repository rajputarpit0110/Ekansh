import mongoose from "mongoose";
import { Product } from "./src/models/product.model.js";
import { Category } from "./src/models/category.model.js";
import { User } from "./src/models/user.model.js";
import slugify from "slugify";
import dotenv from "dotenv";

dotenv.config();

const categories = [
    { name: "Atta", image: "https://images.unsplash.com/photo-1627485937980-221c88ce04ea?w=500&q=80" },
    { name: "Rice", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80" },
    { name: "Dal", image: "https://images.unsplash.com/photo-1585994270273-04e8aa4c32b9?w=500&q=80" },
    { name: "Spices", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80" },
    { name: "Salt", image: "https://images.unsplash.com/photo-1614274291880-9988295b9cb7?w=500&q=80" },
    { name: "Sugar", image: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&q=80" },
    { name: "Tea", image: "https://images.unsplash.com/photo-1576092762791-dd9e2220abd4?w=500&q=80" },
    { name: "Coffee", image: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=500&q=80" },
    { name: "Oil", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80" },
    { name: "Ghee", image: "https://images.unsplash.com/photo-1614274291880-9988295b9cb7?w=500&q=80" },
    { name: "Snacks", image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&q=80" },
    { name: "Biscuits", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80" },
    { name: "Noodles", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80" },
    { name: "Dairy", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80" },
    { name: "Dry Fruits", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&q=80" },
    { name: "Frozen Foods", image: "https://images.unsplash.com/photo-1614274291880-9988295b9cb7?w=500&q=80" },
    { name: "Organic Foods", image: "https://images.unsplash.com/photo-1601647998634-1188019a5b67?w=500&q=80" },
    { name: "Personal Care", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&q=80" },
    { name: "Cleaning Essentials", image: "https://images.unsplash.com/photo-1584820927508-0136fb05bb88?w=500&q=80" },
    { name: "Baby Care", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80" },
    { name: "Health Drinks", image: "https://images.unsplash.com/photo-1506802913710-1db256e210fa?w=500&q=80" },
    { name: "Instant Foods", image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500&q=80" },
    { name: "Beverages", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80" },
    { name: "Household", image: "https://images.unsplash.com/photo-1584820927508-0136fb05bb88?w=500&q=80" },
    { name: "Home Care", image: "https://images.unsplash.com/photo-1584820927508-0136fb05bb88?w=500&q=80" },
    { name: "Vegetables", image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=500&q=80" },
    { name: "Fruits", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80" }
];

const brands = ["Aashirvaad", "India Gate", "Tata", "Everest", "MDH", "Catch", "Fortune", "Amul", "Britannia", "Parle", "Nestle", "Patanjali", "Haldirams", "Maggi", "Surf Excel", "Pampers"];

const generateProducts = (categoryDocs) => {
    const products = [];
    let skuCounter = 1000;

    for (let i = 0; i < 200; i++) {
        const cat = categoryDocs[Math.floor(Math.random() * categoryDocs.length)];
        const hasBrand = Math.random() > 0.5;
        const brand = hasBrand ? brands[Math.floor(Math.random() * brands.length)] : undefined;
        const price = Math.floor(Math.random() * 500) + 50;
        const discountPrice = price - Math.floor(Math.random() * 30);
        const name = brand ? `${brand} Premium ${cat.name} ${Math.floor(Math.random() * 100) + 1}kg` : `Fresh Organic ${cat.name} ${Math.floor(Math.random() * 100) + 1}kg`;

        products.push({
            name,
            slug: slugify(name, { lower: true }) + '-' + i,
            description: brand ? `High quality ${cat.name} from ${brand}. 100% natural and safe.` : `High quality generic ${cat.name}. 100% natural and safe.`,
            sku: `SKU-${skuCounter++}`,
            category: cat._id,
            price,
            discountPrice,
            stock: Math.floor(Math.random() * 100) + 10,
            weight: "1kg",
            brand,
            images: [
                { 
                    publicId: `dummy_${i}`, 
                    url: brand ? 'https://res.cloudinary.com/dlkuzx9n5/image/upload/v1780177042/products/okiinkuutyyvgeb56x77.jpg' : cat.image 
                }
            ],
            ratings: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
            numOfReviews: Math.floor(Math.random() * 500)
        });
    }
    return products;
};

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        await Product.deleteMany();
        await Category.deleteMany();
        await User.deleteMany();

        // Seed Users
        const masterAdmin = await User.create({
            name: "Master Admin",
            email: "admin@topnotchproducts.com",
            password: "admin123",
            role: "superadmin"
        });

        const adminUser = await User.create({
            name: "Admin User",
            email: "admin@freshmart.com",
            password: "password123",
            role: "superadmin"
        });

        const testUser = await User.create({
            name: "Test User",
            email: "test@freshmart.com",
            password: "password123"
        });

        console.log("Master Admin, Admin and Test Users seeded.");

        // Seed Categories
        const catDocs = await Category.insertMany(
            categories.map(c => ({
                name: c.name,
                slug: slugify(c.name, { lower: true }),
                image: c.image
            }))
        );

        console.log(`${catDocs.length} Categories seeded.`);

        // Seed Products
        const productsData = generateProducts(catDocs);
        await Product.insertMany(productsData);

        console.log(`200+ Products seeded successfully.`);
        
        // Setup text indexes manually just in case
        await Product.syncIndexes();
        console.log(`Indexes synced.`);

        process.exit();
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
