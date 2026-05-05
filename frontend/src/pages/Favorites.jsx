import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Pagination, Spin, Empty, Typography, message, Button, Popconfirm
} from 'antd';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const { Text } = Typography;

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, [page, pageSize]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await api.get('/favorites', {
        params: { page, page_size: pageSize }
      });
      setFavorites(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (artworkId) => {
    try {
      await api.delete(`/artworks/${artworkId}/favorite`);
      message.success('已取消收藏');
      fetchFavorites();
    } catch (error) {
      message.error('取消收藏失败');
    }
  };

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize || pageSize);
  };

  return (
    <div>
      <Card title="我的收藏" className="mb-24">
        {loading ? (
          <div className="loading-center">
            <Spin size="large" />
          </div>
        ) : favorites.length > 0 ? (
          <div>
            <Row gutter={[16, 16]}>
              {favorites.map(item => (
                <Col xs={12} sm={8} md={6} key={item.id}>
                  <Card
                    hoverable
                    className="artwork-card"
                    cover={
                      <img
                        alt={item.artwork?.title}
                        src={item.artwork?.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=placeholder%20artwork%20painting&image_size=square'}
                        style={{ height: '180px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => navigate(`/artworks/${item.artwork_id}`)}
                      />
                    }
                    actions={[
                      <Button 
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/artworks/${item.artwork_id}`)}
                      >
                        查看
                      </Button>,
                      <Popconfirm
                        title="确定要取消收藏吗？"
                        onConfirm={() => handleRemoveFavorite(item.artwork_id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button icon={<DeleteOutlined />} danger>
                          取消收藏
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <Card.Meta
                      title={<Text ellipsis>{item.artwork?.title}</Text>}
                      description={
                        <div>
                          <Text type="danger" strong>¥{item.artwork?.price}</Text>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {total > pageSize && (
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
            )}
          </div>
        ) : (
          <div className="favorite-empty">
            <Empty description="您还没有收藏任何工艺品" />
            <Button type="primary" onClick={() => navigate('/artworks')} style={{ marginTop: '16px' }}>
              去逛逛
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Favorites;
