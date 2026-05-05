import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Image, Descriptions, Button, message,
  Comment, Avatar, Form, Input, Pagination, Spin, Empty, Typography, Divider, Tag
} from 'antd';
import {
  HeartOutlined, HeartFilled, LikeOutlined, LikeFilled,
  DislikeOutlined, DislikeFilled, StarOutlined, StarFilled,
  ArrowLeftOutlined, EyeOutlined, UserOutlined
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [artwork, setArtwork] = useState(null);
  const [likeStatus, setLikeStatus] = useState({ liked: false, disliked: false });
  const [favorited, setFavorited] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentForm] = Form.useForm();

  useEffect(() => {
    const fetchArtwork = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/artworks/${id}`);
        setArtwork(res.data);
      } catch (error) {
        console.error('Failed to fetch artwork:', error);
        message.error('获取工艺品详情失败');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtwork();
      fetchComments();
      if (user) {
        fetchLikeStatus();
        fetchFavoriteStatus();
      }
    }
  }, [id, user]);

  const fetchLikeStatus = async () => {
    try {
      const res = await api.get(`/artworks/${id}/like-status`);
      setLikeStatus(res.data);
    } catch (error) {
      console.error('Failed to fetch like status:', error);
    }
  };

  const fetchFavoriteStatus = async () => {
    try {
      const res = await api.get(`/artworks/${id}/favorite-status`);
      setFavorited(res.data.favorited);
    } catch (error) {
      console.error('Failed to fetch favorite status:', error);
    }
  };

  const fetchComments = async () => {
    setCommentsLoading(true);
    try {
      const res = await api.get(`/artworks/${id}/comments`, {
        params: { page: commentsPage, page_size: 10 }
      });
      setComments(res.data.data || []);
      setCommentsTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      message.info('请先登录');
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post(`/artworks/${id}/like`);
      setLikeStatus(prev => ({ ...prev, liked: res.data.liked, disliked: false }));
      if (res.data.liked) {
        setArtwork(prev => ({ ...prev, likes: prev.likes + 1 }));
        message.success('点赞成功');
      } else {
        setArtwork(prev => ({ ...prev, likes: prev.likes - 1 }));
        message.success('取消点赞');
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      message.info('请先登录');
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      const res = await api.post(`/artworks/${id}/dislike`);
      setLikeStatus(prev => ({ ...prev, disliked: res.data.disliked, liked: false }));
      if (res.data.disliked) {
        setArtwork(prev => ({ ...prev, dislikes: prev.dislikes + 1 }));
        message.success('已踩');
      } else {
        setArtwork(prev => ({ ...prev, dislikes: prev.dislikes - 1 }));
        message.success('取消踩');
      }
    } catch (error) {
      message.error('操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) {
      message.info('请先登录');
      navigate('/login');
      return;
    }
    setActionLoading(true);
    try {
      if (favorited) {
        await api.delete(`/artworks/${id}/favorite`);
        setFavorited(false);
        message.success('已取消收藏');
      } else {
        await api.post(`/artworks/${id}/favorite`);
        setFavorited(true);
        message.success('收藏成功');
      }
    } catch (error) {
      message.error(error.response?.data?.error || '操作失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitComment = async (values) => {
    if (!user) {
      message.info('请先登录');
      navigate('/login');
      return;
    }
    try {
      await api.post(`/artworks/${id}/comments`, { content: values.content });
      message.success('评论发布成功');
      commentForm.resetFields();
      fetchComments();
    } catch (error) {
      message.error('评论发布失败');
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!artwork) {
    return (
      <Card>
        <Empty description="工艺品不存在" />
      </Card>
    );
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: '16px' }}
      >
        返回
      </Button>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          <Card>
            <Image
              className="artwork-detail-image"
              src={artwork.image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=placeholder%20artwork%20painting&image_size=square'}
              alt={artwork.title}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card>
            <Title level={2}>{artwork.title}</Title>
            
            <div style={{ marginBottom: '16px' }}>
              <Tag color="blue">{artwork.category?.name || '未分类'}</Tag>
              <Text type="secondary" style={{ marginLeft: '12px' }}>
                <EyeOutlined /> {artwork.views} 浏览
              </Text>
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="价格">
                <Text type="danger" strong style={{ fontSize: '18px' }}>
                  ¥{artwork.price}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="艺术家">{artwork.artist || '-'}</Descriptions.Item>
              <Descriptions.Item label="创作年份">{artwork.year || '-'}</Descriptions.Item>
              <Descriptions.Item label="材质">{artwork.material || '-'}</Descriptions.Item>
              <Descriptions.Item label="尺寸">{artwork.dimensions || '-'}</Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {dayjs(artwork.created_at).format('YYYY-MM-DD')}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button
                icon={likeStatus.liked ? <LikeFilled /> : <LikeOutlined />}
                onClick={handleLike}
                loading={actionLoading}
                type={likeStatus.liked ? 'primary' : 'default'}
              >
                赞 ({artwork.likes})
              </Button>
              <Button
                icon={likeStatus.disliked ? <DislikeFilled /> : <DislikeOutlined />}
                onClick={handleDislike}
                loading={actionLoading}
                danger={likeStatus.disliked}
              >
                踩 ({artwork.dislikes})
              </Button>
              <Button
                icon={favorited ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
                onClick={handleFavorite}
                loading={actionLoading}
              >
                {favorited ? '已收藏' : '收藏'}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {artwork.description && (
        <Card title="作品介绍" style={{ marginTop: '24px' }}>
          <Paragraph>{artwork.description}</Paragraph>
        </Card>
      )}

      <Card title="评论区" style={{ marginTop: '24px' }}>
        {user && (
          <Form
            form={commentForm}
            onFinish={handleSubmitComment}
            style={{ marginBottom: '24px' }}
          >
            <Form.Item
              name="content"
              rules={[{ required: true, message: '请输入评论内容' }]}
            >
              <TextArea rows={3} placeholder="发表你的评论..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                发表评论
              </Button>
            </Form.Item>
          </Form>
        )}

        {commentsLoading ? (
          <div className="loading-center">
            <Spin size="small" />
          </div>
        ) : comments.length > 0 ? (
          <div>
            {comments.map(comment => (
              <Comment
                key={comment.id}
                author={comment.user?.nickname || comment.user?.username || '匿名用户'}
                avatar={<Avatar icon={<UserOutlined />} src={comment.user?.avatar} />}
                content={<p>{comment.content}</p>}
                datetime={dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}
              />
            ))}
            {commentsTotal > 10 && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <Pagination
                  current={commentsPage}
                  pageSize={10}
                  total={commentsTotal}
                  onChange={(page) => {
                    setCommentsPage(page);
                    fetchComments();
                  }}
                  size="small"
                />
              </div>
            )}
          </div>
        ) : (
          <Empty description="暂无评论，快来发表第一条评论吧！" />
        )}
      </Card>
    </div>
  );
};

export default ArtworkDetail;
