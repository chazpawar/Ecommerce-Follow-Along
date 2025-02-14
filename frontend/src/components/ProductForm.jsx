import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ProductForm = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch product data if in edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setIsLoading(true);
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
          const productData = response.data;
          setProduct(productData);
          setProductName(productData.name);
          setDescription(productData.description);
          setPrice(productData.price);
          setCategory(productData.category);
        } catch (error) {
          console.error('Error fetching product:', error);
          setToastMessage('Failed to fetch product details');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();
  }, [id]);

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const validateForm = () => {
    if (!productName || !description || !price || !category) {
      setToastMessage("Please fill in all fields.");
      return false;
    }
    // Only require images for new products
    if (!product && images.length === 0) {
      setToastMessage("Please upload at least one image.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', productName);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('category', category);
      
      if (!product) {
        // Creating new product
        formData.append('userEmail', localStorage.getItem('userEmail'));
      }

      // Append each image to formData only if new images are selected
      if (images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      };

      let response;
      if (product) {
        // Update existing product
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/api/products/update/${product._id}`,
          formData,
          config
        );
        setToastMessage("Product updated successfully!");
      } else {
        // Create new product
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/products/create`,
          formData,
          config
        );
        setToastMessage("Product created successfully!");
      }

      if (!response.data) {
        throw new Error(product ? 'Failed to update product' : 'Failed to create product');
      }

      // Reset form if creating new product
      if (!product) {
        resetForm();
      }
      
      // Add a delay before navigation to show the success message
      setTimeout(() => {
        window.location.href = '/my-products';
      }, 2000);
    } catch (error) {
      console.error('Error creating product:', error);
      setToastMessage(
        error.response?.data?.message ||
        error.message ||
        'Failed to create product. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setProductName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImages([]);
    setPreviewImages([]);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {product ? 'Edit Product' : 'Create Product'}
            </h1>
            <p className="text-gray-600">
              {product ? 'Update your product details below' : 'Enter your product details below'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 h-32"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price
              </label>
              <input
                type="number"
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Product Images
              </label>
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              {/* Show newly selected images */}
              {previewImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">New Images:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {previewImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg shadow-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Show existing product images in edit mode */}
              {product && product.images && product.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Images:</p>
                  <div className="grid grid-cols-2 gap-4">
                    {product.images.map((image, index) => (
                      <img
                        key={`existing-${index}`}
                        src={`${import.meta.env.VITE_API_URL}${image}`}
                        alt={`Product ${index + 1}`}
                        className="h-32 w-full object-cover rounded-lg shadow-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {product ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right side image section */}
      <div className="hidden md:block md:w-1/2">
        <div className="h-full w-full bg-cover bg-center relative">
          <img 
            src="https://www.home-designing.com/wp-content/uploads/2016/02/minimalistic-decor-ideas.jpg"
            alt="Product Showcase"
            className="w-full h-full object-cover absolute inset-0"
          />
          <div className="h-full w-full bg-black bg-opacity-50 flex items-center justify-center p-12 relative z-10">
            <div className="text-white text-center">
              <h2 className="text-4xl font-bold mb-4">Create Amazing Products</h2>
              <p className="text-lg text-gray-200">
                Share your products with the world
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black text-white py-3 px-6 rounded-lg shadow-xl z-50 transition-opacity duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default ProductForm;