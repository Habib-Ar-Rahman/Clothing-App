"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ArrowRight, Star, Shield, Truck, RefreshCw, Heart, ShoppingCart, Play, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { productsApi } from "@/lib/api";

// Product interface
interface Product {
	_id: string;
	name: string;
	description: string;
	images: string[];
	price: number;
	originalPrice?: number;
	rating?: number;
	reviews?: number;
	badge?: string;
}

// Categories data
const categories = [
	{ name: "Leather Jackets", count: "25+ Items", image: "/leather-jacket.jpg" },
	{ name: "Fur Coats", count: "18+ Items", image: "/fur-jacket.jpg" },
	{ name: "Boots", count: "32+ Items", image: "/boots.jpg" },
	{ name: "Accessories", count: "45+ Items", image: "/belt.jpg" },
];

// Testimonials data
const testimonials = [
	{
		name: "Sarah Johnson",
		role: "Fashion Enthusiast",
		content: "Absolutely love my leather jacket from Velewera! The quality is exceptional and the fit is perfect.",
		rating: 5,
		avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
	},
	{
		name: "Michael Chen",
		role: "Style Blogger",
		content: "Best online shopping experience I've had. Fast delivery and premium quality products.",
		rating: 5,
		avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
	},
	{
		name: "Emma Davis",
		role: "Professional",
		content: "The fur coat I ordered exceeded my expectations. Luxurious feel and perfect for winter.",
		rating: 5,
		avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
	},
];

export default function Home() {
	const [currentTestimonial, setCurrentTestimonial] = useState(0);
	const [isVideoPlaying, setIsVideoPlaying] = useState(false);
	const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

	// Fetch featured products from API (take first 4 to match Products page dataset)
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const response = await productsApi.getAll();
				const allProducts = response.data;
				setFeaturedProducts(allProducts.slice(0, 4));
			} catch (error) {
				console.error('Error fetching products:', error);
			}
		};
		fetchProducts();
	}, []);

	// Add to Wishlist function
	const addToWishlist = (product: Product) => {
		const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
		const isAlreadyInWishlist = wishlist.some((item: Product) => item._id === product._id);
		
		if (!isAlreadyInWishlist) {
			wishlist.push(product);
			localStorage.setItem('wishlist', JSON.stringify(wishlist));
			window.dispatchEvent(new Event('wishlistUpdated'));
		}
	};

	// Add to Cart function
	const addToCart = (product: Product) => {
		const cart = JSON.parse(localStorage.getItem('cart') || '[]');
		const isAlreadyInCart = cart.some((item: Product) => item._id === product._id);
		
		if (!isAlreadyInCart) {
			cart.push({ ...product, quantity: 1 });
			localStorage.setItem('cart', JSON.stringify(cart));
			window.dispatchEvent(new Event('cartUpdated'));
		}
	};

	return (
		<div className="min-h-screen bg-white dark:bg-gray-900 font-sans">
			<Navbar />

			{/* Hero Section - Modern with Video Background */}
			<section className="relative min-h-screen flex items-center justify-center overflow-hidden">
				{/* Background with overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent z-10"></div>
				<div className="absolute inset-0">
					<Image
						src="/hero.png"
						alt="Hero Background"
						fill
						className="object-cover"
						priority
					/>
				</div>
				
				{/* Hero Content */}
				<div className="relative z-20 text-center px-4 sm:px-8 max-w-6xl mx-auto">
					<div className="mb-6">
						<span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20">
							✨ New Collection 2025
						</span>
					</div>
					<h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
						Luxury Fashion
						<span className="block text-black">
							Redefined
						</span>
					</h1>
					<p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
						Discover our exclusive collection of handcrafted leather jackets, luxury fur coats, 
						and premium accessories. Where timeless elegance meets modern sophistication.
					</p>
					
					<div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
						<Link href="/products">
							<button className="group bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-3 shadow-2xl">
								Shop Collection
								<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
							</button>
						</Link>
						<button 
							onClick={() => setIsVideoPlaying(true)}
							className="group flex items-center gap-3 text-white hover:text-gray-400 transition-colors duration-300"
						>
							<div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
								<Play className="w-6 h-6 ml-1" />
							</div>
							<span className="text-lg font-medium">Watch Our Story</span>
						</button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-gray-50 dark:bg-gray-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Why Choose Velewera?
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							Experience the difference with our commitment to quality, service, and style
						</p>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
						<div className="text-center group">
							<div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
								<Shield className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Premium Quality</h3>
							<p className="text-gray-600 dark:text-gray-300">Handcrafted with the finest materials and attention to detail</p>
						</div>
						
						<div className="text-center group">
							<div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
								<RefreshCw className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Easy Returns</h3>
							<p className="text-gray-600 dark:text-gray-300">30-day hassle-free returns and exchanges</p>
						</div>
						
						<div className="text-center group">
							<div className="w-16 h-16 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
								<Star className="w-8 h-8 text-white" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5-Star Service</h3>
							<p className="text-gray-600 dark:text-gray-300">Award-winning customer service and support</p>
						</div>
					</div>
				</div>
			</section>

			{/* Categories Section */}
			<section className="py-20 bg-white dark:bg-gray-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Shop by Category
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300">
							Explore our curated collections
						</p>
					</div>
					
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
						{categories.map((category, index) => (
							<Link key={index} href="/products" className="group">
								<div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 aspect-square">
									<Image
										src={category.image}
										alt={category.name}
										fill
										className="object-cover group-hover:scale-110 transition-transform duration-500"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
									<div className="absolute bottom-6 left-6 text-white">
										<h3 className="text-xl font-bold mb-1">{category.name}</h3>
										<p className="text-sm text-gray-200">{category.count}</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Featured Products Section */}
			<section className="py-20 bg-gray-50 dark:bg-gray-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Featured Products
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300">
							Handpicked favorites from our premium collection
						</p>
					</div>
					
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
						{featuredProducts.map((product) => (
							<div key={product._id} className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
								{/* Badge */}
								<div className="absolute top-4 left-4 z-10 bg-black text-white px-3 py-1 rounded-full text-xs font-semibold">
									Premium
								</div>
								
								{/* Product Image */}
								<div className="relative aspect-square overflow-hidden">
									<Link href={`/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`}> 
										{product.images[0] && (
											<Image
												src={product.images[0] || '/placeholder.jpg'}
												alt={product.name}
												fill
												className="object-cover group-hover:scale-110 transition-transform duration-500"
											/>
										)}
									</Link>
									{/* Wishlist Button */}
									<div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
										<button
											onClick={(e) => {
												e.preventDefault();
												addToWishlist(product);
											}}
											className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
										>
											<Heart className="w-5 h-5 text-gray-700" />
										</button>
									</div>
								</div>

								{/* Product Info */}
								<div className="p-6">
									<Link href={`/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`}>
										<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-600 transition-colors">
											{product.name}
										</h3>
									</Link>

									{/* Price and Add */}
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="text-xl font-bold text-gray-900 dark:text-white">
												₹{product.price.toLocaleString()}
											</span>
										</div>
										<button
											onClick={(e) => {
												e.preventDefault();
												addToCart(product);
											}}
											className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center gap-2"
										>
											<ShoppingCart className="w-4 h-4" />
											Add
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
					
					<div className="text-center mt-12">
						<Link href="/products">
							<button className="bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl">
								View All Products
							</button>
						</Link>
					</div>
				</div>
			</section>

			{/* Testimonials Section */}
			<section className="py-20 bg-white dark:bg-gray-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
							What Our Customers Say
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300">
							Join thousands of satisfied customers worldwide
						</p>
					</div>
					
					<div className="relative max-w-4xl mx-auto">
						<div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 md:p-12">
							<div className="text-center">
								<div className="flex justify-center mb-6">
									{[...Array(5)].map((_, i) => (
										<Star key={i} className="w-6 h-6 text-amber-400 fill-current" />
									))}
								</div>
								
								<blockquote className="text-2xl md:text-3xl font-medium text-gray-900 dark:text-white mb-8 leading-relaxed">
									"{testimonials[currentTestimonial].content}"
								</blockquote>
								
								<div className="flex items-center justify-center gap-4">
									<Image
										src={testimonials[currentTestimonial].avatar}
										alt={testimonials[currentTestimonial].name}
										width={60}
										height={60}
										className="rounded-full"
									/>
									<div className="text-left">
										<div className="font-semibold text-gray-900 dark:text-white text-lg">
											{testimonials[currentTestimonial].name}
										</div>
										<div className="text-gray-600 dark:text-gray-300">
											{testimonials[currentTestimonial].role}
										</div>
									</div>
								</div>
							</div>
						</div>
						
						{/* Navigation */}
						<div className="flex justify-center gap-4 mt-8">
							<button
								onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
								className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
							>
								<ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
							</button>
							<button
								onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
								className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
							>
								<ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
							</button>
						</div>
						
						{/* Dots indicator */}
						<div className="flex justify-center gap-2 mt-6">
							{testimonials.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentTestimonial(index)}
									className={`w-3 h-3 rounded-full transition-colors ${
										index === currentTestimonial
											? "bg-black"
											: "bg-gray-300 dark:bg-gray-600"
									}`}
								/>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* About Section - Modern Design */}
			<section className="py-20 bg-gray-200 dark:bg-gray-800">
				<div className="max-w-7xl mx-auto px-4 sm:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
						<div>
							<h2 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-6">
								Crafting Excellence Since 2025
							</h2>
							<p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
								At Velewera, we believe that luxury isn't just about the product—it's about the experience. 
								Our master craftsmen combine traditional techniques with modern innovation to create pieces 
								that stand the test of time.
							</p>
							<div className="grid grid-cols-2 gap-8 mb-8">
				
								<div>
									<div className="text-3xl font-bold text-black mb-2">2K+</div>
									<div className="text-black">Happy Customers</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-black mb-2">100%</div>
									<div className="text-black">Premium Materials</div>
								</div>
								<div>
									<div className="text-3xl font-bold text-black mb-2">4.9★</div>
									<div className="text-black">Customer Rating</div>
								</div>
							</div>
							<Link href="/about">
								<button className="bg-black text-white px-8 py-4 rounded-full font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg">
									Learn More About Us
								</button>
							</Link>
						</div>
						<div className="relative">
							<div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
								<Image
									src="/learn more about us.png"
									alt="Craftsmanship"
									fill
									className="object-cover"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Contact Section - Modern Design */}
			<section className="py-20 bg-white dark:bg-gray-900">
				<div className="max-w-7xl mx-auto px-4 sm:px-8">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
							Get in Touch
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
							Looking for a truly personalized jacket? Our highly skilled craftsmen specialize in creating customizable jackets that meet the highest standards of premium quality and design. Need details on designing your next favorite jacket or have any other inquiries about Velewera? Our expert support team is ready to assist you with all your needs.
						</p>
					</div>
					
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
						{/* Contact Info */}
						<div className="space-y-8">
							{/* Contact Methods */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								<div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
									<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
										</svg>
									</div>
									<div>
										<h4 className="font-semibold text-gray-900 dark:text-white mb-1">Call Us</h4>
										<p className="text-gray-600 dark:text-gray-300 text-sm">+91-7004989933</p>
										<p className="text-gray-500 dark:text-gray-400 text-xs">Mon-Fri 9AM-6PM EST</p>
									</div>
								</div>
								
								<div className="flex items-start gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl">
									<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
									</div>
									<div>
										<h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email Us</h4>
										<p className="text-gray-600 dark:text-gray-300 text-sm">support@velewera.com</p>
										<p className="text-gray-500 dark:text-gray-400 text-xs">We reply within 24 hours</p>
									</div>
								</div>
							</div>
							
							{/* Social Media */}
							<div className="text-center">
								<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
									Follow Us
								</h3>
								<div className="flex justify-center gap-4">
									<a href="#" className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white hover:bg-blue-700 transition-colors hover:scale-110 transform duration-200">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
											<path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482c-4.086-.205-7.697-2.164-10.126-5.144a4.822 4.822 0 0 0-.666 2.475c0 1.708.87 3.216 2.188 4.099a4.904 4.904 0 0 1-2.229-.616c-.054 1.997 1.397 3.872 3.448 4.292a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417a9.867 9.867 0 0 1-6.102 2.104c-.396 0-.787-.023-1.175-.069a13.945 13.945 0 0 0 7.548 2.212c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636a10.025 10.025 0 0 0 2.459-2.548z"/>
										</svg>
									</a>
									<a href="#" className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center text-white hover:bg-pink-700 transition-colors hover:scale-110 transform duration-200">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
											<path d="M7.75 2A5.75 5.75 0 0 0 2 7.75v8.5A5.75 5.75 0 0 0 7.75 22h8.5A5.75 5.75 0 0 0 22 16.25v-8.5A5.75 5.75 0 0 0 16.25 2h-8.5zm0 1.5h8.5A4.25 4.25 0 0 1 20.5 7.75v8.5A4.25 4.25 0 0 1 16.25 20.5h-8.5A4.25 4.25 0 0 1 3.5 16.25v-8.5A4.25 4.25 0 0 1 7.75 3.5zm4.25 2.25a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5zm0 1.5a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5zm5.25.75a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
										</svg>
									</a>
									<a href="#" className="w-12 h-12 bg-blue-800 rounded-xl flex items-center justify-center text-white hover:bg-blue-900 transition-colors hover:scale-110 transform duration-200">
										<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
											<path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.326v21.348c0 .733.592 1.326 1.325 1.326h11.495v-9.294h-3.128v-3.622h3.128v-2.672c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12v9.294h6.116c.733 0 1.325-.593 1.325-1.326v-21.349c0-.733-.592-1.325-1.325-1.325z"/>
										</svg>
									</a>
								</div>
							</div>
						</div>
						
						{/* Contact Form */}
						<div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8">
							<h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
								Send us a Message
							</h3>
							<form className="space-y-6">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											First Name
										</label>
										<input
											type="text"
											className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
											placeholder="John"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
											Last Name
										</label>
										<input
											type="text"
											className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
											placeholder="Doe"
										/>
									</div>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Email Address
									</label>
									<input
										type="email"
										className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors"
										placeholder="john@example.com"
									/>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Subject
									</label>
									<select className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
										<option>General Inquiry</option>
										<option>Product Question</option>
										<option>Order Support</option>
										<option>Custom Order</option>
									</select>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Message
									</label>
									<textarea
										rows={5}
										className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors resize-none"
										placeholder="Tell us how we can help you..."
									></textarea>
								</div>
								
								<button
									type="submit"
									className="w-full bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
								>
									Send Message
								</button>
							</form>
						</div>
					</div>
				</div>
			</section>

			{/* Newsletter Section */}
			<section className="py-20 bg-black">
				<div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
					<h2 className="text-4xl font-bold text-white mb-4">
						Stay in Style
					</h2>
					<p className="text-xl text-white/90 mb-8">
						Subscribe to our newsletter and be the first to know about new collections, 
						exclusive offers, and style tips from our experts.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
						<input
							type="email"
							placeholder="Enter your email"
							className="flex-1 px-6 py-4 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/70 transition-all duration-300"
						/>
						<button className="bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg whitespace-nowrap">
							Subscribe
						</button>
					</div>
				</div>
			</section>

			<Footer />
		</div>
	);
}