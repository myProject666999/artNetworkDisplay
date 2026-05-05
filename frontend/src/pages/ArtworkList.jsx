import React, { useEffect, useState } from 'react';
import { 
  Row, Col, Card, Input, Select, Pagination, Spin, Empty, Typography
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

const { Text } = Typography;
const { Search } = Input;

const ArtworkList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category_id') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          page_size: pageSize,
          ...(keyword && { keyword }),
          ...(categoryId && { category_id: categoryId }),
          sort: sortBy
        };
        const res = await api.get('/artworks', { params });
        setArtworks(res.data.data || []);
        setTotal(res.data.total || 0);
      } catch (error) {
        console.error('Failed to fetch artworks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, [page, pageSize, keyword, categoryId, sortBy]);

  const handleSearch = (value) => {
    setKeyword(value);
    setPage(1);
    updateSearchParams({ keyword: value, page: 1 });
  };

  const handleCategoryChange = (value) => {
    setCategoryId(value);
    setPage(1);
    updateSearchParams({ category_id: value, page: 1 });
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
    updateSearchParams({ sort: value, page: 1 });
  };

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize || pageSize);
    updateSearchParams({ page: newPage });
  };

  const updateSearchParams = (params) => {
    const current = Object.fromEntries(searchParams.entries());
    const newParams = { ...current, ...params };
    Object.keys(newParams).forEach(key => {
      if (!newParams[key]) delete newParams[key];
    });
    setSearchParams(newParams);
  };

  return (
    <div>
      <Row gutter={24} className="mb-24">
        <Col xs={24}>
          <Card>
            <Row gutter={16}>
            <Col xs={24} md={6}>
                <Search
                  placeholder="搜索工艺品名称、作者..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onSearch={handleSearch}
                  enterButton={<SearchOutlined />}
                  allowClear
                />
              </Col>
              <Col xs={24} md={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="选择分类"
                  value={categoryId || undefined}
                  onChange={handleCategoryChange}
                  allowClear
                  options={[
                    { value: '', label: '全部分类' },
                    ...categories.map(c => ({ value: String(c.id), label: c.name }))
                  ]}
                />
              </Col>
              <Col xs={24} md={6}>
                <Select
                  style={{ width: '100%' }}
                  value={sortBy}
                  onChange={handleSortChange}
                  options={[
                    { value: 'newest', label: '最新发布' },
                    { value: 'views', label: '最多浏览' },
                    { value: 'likes', label: '最多点赞' }
                  ]}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {loading ? (
        <div className="loading-center">
          <Spin size="large" />
        </div>
      ) : artworks.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {artworks.map(item => (
              <Col xs={12} sm={8} md={6} key={item.id}>
                <Card
                  hoverable
                  className="artwork-card"
                  cover={
                    <img
                      alt={item.title}
                      src={item.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=placeholder%20artwork%20painting&image_size=square'}
                      style={{ height: '180px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => navigate(`/artworks/${item.id}`)}
                    />
                  }
                  onClick={() => navigate(`/artworks/${item.id}`)}
                >
                  <Card.Meta
                    title={<Text ellipsis>{item.title}</Text>}
                    description={
                      <div>
                        <div style={{ marginBottom: '4px' }}>
                          <Text type="danger" strong>¥{item.price}</Text>
                        </div>
                        <div>
                          <EyeOutlined style={{ marginRight: '4px' }} />
                          <Text type="secondary">{item.views}</Text>
                          <Text type="secondary" style={{ marginLeft: '12px' }}>
                            ❤️ {item.likes}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['12', '24', '48']}
              showTotal={(total) => `共 ${total} 件`}
            />
          </div>
        </>
      ) : (
        <Card>
          <Empty description="暂无工艺品数据" />
        </Card>
      )}
    </div>
  );
};

export default ArtworkList;
