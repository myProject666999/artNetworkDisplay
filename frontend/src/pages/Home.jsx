import React, { useEffect, useState } from 'react';
import { Row, Col, Carousel, Card, List, Typography, Tag, Spin, Empty } from 'antd';
import { EyeOutlined, ClockCircleOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const Home = () => {
  const [carousel, setCarousel] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [hotArtworks, setHotArtworks] = useState([]);
  const [newArtworks, setNewArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [carouselRes, announcementsRes, hotArtworksRes, newArtworksRes] = await Promise.all([
          api.get('/carousel'),
          api.get('/announcements', { params: { page_size: 5 } }),
          api.get('/artworks', { params: { sort: 'likes', page_size: 6 } }),
          api.get('/artworks', { params: { sort: 'newest', page_size: 6 } }),
        ]);
        
        setCarousel(carouselRes.data);
        setAnnouncements(announcementsRes.data.data || []);
        setHotArtworks(hotArtworksRes.data.data || []);
        setNewArtworks(newArtworksRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const defaultCarousel = [
    {
      id: 1,
      title: '欢迎来到艺术品展示系统',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20traditional%20chinese%20art%20gallery%20exhibition%20with%20classical%20paintings&image_size=landscape_16_9',
      link: '/artworks'
    },
    {
      id: 2,
      title: '精美工艺品等你来赏',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20ceramic%20pottery%20artwork%20display%20museum%20lighting&image_size=landscape_16_9',
      link: '/artworks'
    },
    {
      id: 3,
      title: '探索艺术的魅力',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=art%20gallery%20interior%20with%20modern%20paintings%20on%20walls&image_size=landscape_16_9',
      link: '/artworks'
    }
  ];

  const displayCarousel = carousel.length > 0 ? carousel : defaultCarousel;

  if (loading) {
    return (
      <div className="loading-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Carousel className="carousel-container" autoplay effect="fade">
        {displayCarousel.map(item => (
          <div key={item.id}>
            <img 
              src={item.image} 
              alt={item.title}
              style={{ width: '100%', height: '400px', objectFit: 'cover' }}
              onClick={() => item.link && navigate(item.link)}
            />
          </div>
        ))}
      </Carousel>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          <Card
            className="mb-24"
            title={
              <span>
                <FireOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                热门工艺品
              </span>
            }
            extra={<a onClick={() => navigate('/artworks')}>查看更多 →</a>}
          >
            {hotArtworks.length > 0 ? (
              <Row gutter={16}>
                {hotArtworks.map(item => (
                  <Col xs={12} md={8} key={item.id}>
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
            ) : (
              <Empty description="暂无热门工艺品" />
            )}
          </Card>

          <Card
            className="mb-24"
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                最新上架
              </span>
            }
            extra={<a onClick={() => navigate('/artworks')}>查看更多 →</a>}
          >
            {newArtworks.length > 0 ? (
              <Row gutter={16}>
                {newArtworks.map(item => (
                  <Col xs={12} md={8} key={item.id}>
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
            ) : (
              <Empty description="暂无最新工艺品" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                最新公告
              </span>
            }
            extra={<a onClick={() => navigate('/announcements')}>更多 →</a>}
          >
            {announcements.length > 0 ? (
              <List
                dataSource={announcements}
                renderItem={item => (
                  <List.Item
                    style={{ cursor: 'pointer', padding: '8px 0' }}
                    onClick={() => navigate(`/announcements/${item.id}`)}
                  >
                    <List.Item.Meta
                      title={
                        <span>
                          {item.is_top && <Tag color="red">置顶</Tag>}
                          <Text ellipsis style={{ maxWidth: '200px' }}>{item.title}</Text>
                        </span>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(item.created_at).format('MM-DD HH:mm')}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无公告" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
