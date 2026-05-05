import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Spin, Empty, Button, Typography
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AnnouncementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/announcements/${id}`);
        setAnnouncement(res.data);
      } catch (error) {
        console.error('Failed to fetch announcement:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnnouncement();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="loading-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <Card>
        <Empty description="公告不存在" />
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

      <Card className="announcement-detail">
        <div className="title">{announcement.title}</div>
        <div className="meta">
          <Text type="secondary">
            作者: {announcement.author || '系统'}
            {' | '}
            浏览: {announcement.views}
            {' | '}
            发布时间: {dayjs(announcement.created_at).format('YYYY-MM-DD HH:mm')}
          </Text>
        </div>
        <div className="content" style={{ whiteSpace: 'pre-wrap' }}>
          {announcement.content}
        </div>
      </Card>
    </div>
  );
};

export default AnnouncementDetail;
