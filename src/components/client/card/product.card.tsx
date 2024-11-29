import { Col, Row } from 'antd';
import '@/styles/client.table.scss';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@/redux/hooks';
import React, { useEffect, useState } from 'react';
import { fetchProductByRestaurant } from '@/redux/slice/productSlide';

interface ProductCardProps {
    onAddItem: (item: any) => void;
    activeTabKey: string;
}

interface Product {
    id: number;
    name: string;
    category: string;
    sellingPrice: number;
    image: string;
    quantity: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ onAddItem, activeTabKey }) => {
    const dispatch = useAppDispatch();
    const products = useSelector((state: RootState) => state.product.result);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchProductByRestaurant({ query: '?page=1&size=100' }));
    }, [dispatch]);

    const uniqueCategories = Array.from(
        new Set(products.map(product => product.category))
    );

    const filteredProducts = selectedCategory
        ? products.filter(product => product.category === selectedCategory)
        : products;

    return (
        <div className="container">
            <div className="container-content">
                <Row gutter={[20, 22]}>
                    {filteredProducts.map((product, index) => (
                        <Col span={6} key={product.id}>
                            <div className="product-item">
                                <div
                                    className="item-img"
                                    onClick={() => onAddItem(product)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <img
                                        alt={`${product.name}`}
                                        src={`${import.meta.env.VITE_BACKEND_URL}/storage/product/${product?.image}`}
                                    />
                                </div>

                                <div className="item-card">
                                    <p className="item-card__title">{product.name}</p>
                                    <p className="item-card__price">
                                        {(product.sellingPrice + "")?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        đ
                                    </p>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>

            <div className="container-category">
                <>
                    <div
                        className={`category-card ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        <p className="category-card__name">Tất cả</p>
                    </div>

                    {uniqueCategories.map((category, index) => (
                        <div
                            key={index}
                            className={`category-card ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category || null)}
                        >
                            <p className="category-card__name">
                                {category === 'FOOD' ? "Đồ ăn"
                                    : category === 'DRINK' ? 'Đồ uống' : 'Khác'}
                            </p>
                        </div>
                    ))}
                </>
            </div>
        </div>
    );
};

export default ProductCard;
