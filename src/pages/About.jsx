import { Link } from 'react-router-dom';
import { ArrowRight, Award, Users, Target, Heart, Star } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              About Al-Anwar
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Your trusted partner in quality perfumes, cosmetics, air fresheners, and household goods. 
              We bring excellence to every product we offer.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-lg text-gray-600">
                <p>
                  Al-Anwar was founded with a simple yet powerful vision: to provide Nigerians with 
                  access to high-quality perfumes, cosmetics, and household goods that enhance their 
                  daily lives. Based in Kano State, we understand the unique needs and preferences 
                  of our local community.
                </p>
                <p>
                  Since our inception, we have been committed to sourcing only the finest products 
                  from trusted manufacturers around the world. Our carefully curated selection 
                  ensures that every item meets our strict quality standards before reaching our customers.
                </p>
                <p>
                  We believe that everyone deserves access to quality products that make them feel 
                  confident and comfortable in their own skin. This belief drives everything we do, 
                  from product selection to customer service.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl"></div>
              <img
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
                alt="Al-Anwar Store"
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Mission & Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are guided by principles that shape every decision we make
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-gray-600">
                To provide Nigerians with access to premium quality perfumes, cosmetics, and household goods 
                that enhance their confidence and well-being, while maintaining the highest standards of 
                customer service and product authenticity.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Values</h3>
              <p className="text-gray-600">
                Quality, authenticity, customer satisfaction, and community trust are the cornerstones 
                of our business. We believe in building lasting relationships with our customers through 
                transparency and reliability.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Promise</h3>
              <p className="text-gray-600">
                Every product we sell is carefully selected and tested for quality. We guarantee 
                authenticity and provide excellent customer service to ensure your complete satisfaction 
                with every purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Leadership Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The passionate individuals who drive Al-Anwar's success
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Founder */}
            <div className="text-center">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face"
                  alt="Founder"
                  className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Founder
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Ahmad Al-Anwar</h3>
              <p className="text-blue-600 font-medium mb-3">Founder & Visionary</p>
              <p className="text-gray-600 text-sm">
                With over 15 years of experience in the fragrance and cosmetics industry, Ahmad founded 
                Al-Anwar with a vision to bring authentic, high-quality products to Nigeria. His passion 
                for excellence and deep understanding of customer needs drives our company's direction.
              </p>
            </div>

            {/* CEO */}
            <div className="text-center">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face"
                  alt="CEO"
                  className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  CEO
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fatima Ibrahim</h3>
              <p className="text-green-600 font-medium mb-3">Chief Executive Officer</p>
              <p className="text-gray-600 text-sm">
                Fatima brings strategic leadership and operational excellence to Al-Anwar. With an MBA 
                in Business Administration and extensive experience in retail management, she ensures 
                our company's growth while maintaining our commitment to quality and customer satisfaction.
              </p>
            </div>

            {/* Manager */}
            <div className="text-center">
              <div className="relative mb-6">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face"
                  alt="Manager"
                  className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Manager
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aisha Mohammed</h3>
              <p className="text-purple-600 font-medium mb-3">Operations Manager</p>
              <p className="text-gray-600 text-sm">
                Aisha oversees our daily operations and ensures smooth customer experiences. Her attention 
                to detail and customer-first approach has been instrumental in building Al-Anwar's 
                reputation for exceptional service and reliable product delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Al-Anwar?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best shopping experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">
                All our products are carefully selected and tested for quality assurance
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Team</h3>
              <p className="text-gray-600">
                Our knowledgeable team is always ready to help you find the perfect products
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentic Products</h3>
              <p className="text-gray-600">
                We guarantee 100% authentic products from trusted manufacturers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer First</h3>
              <p className="text-gray-600">
                Your satisfaction is our priority, and we're here to serve you better
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience Quality?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover our carefully curated collection of perfumes, cosmetics, and household goods
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
