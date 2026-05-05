import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin } from 'antd';
import {
  UserOutlined, ShoppingOutlined, MessageOutlined,
  EyeOutlined, TagsOutlined, NotificationOutlined
} from '@ant-design/icons';
import api from '../../api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    artworks: 0,
    categories: 0,
    messages: 0,
    announcements: 0,
    carousel: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [usersRes, artworksRes, categoriesRes, messagesRes, announcementsRes, carouselRes] = await Promise.all([
        api.get('/admin/users', { params: { page_size: 1 } }).catch(() => ({ data: { total: 0 } })),
        api.get('/admin/artworks', { params: { page_size: 1 } }).catch(() => ({ data: { total: 0 } })),
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/admin/messages', { params: { page_size: 1 } }).catch(() => ({ data: { total: 0 } })),
        api.get('/admin/announcements', { params: { page_size: 1 } }).catch(() => ({ data: { total: 0 } })),
        api.get('/admin/carousel').catch(() => ({ data: [] })),
      ]);

      setStats({
        users: usersRes.data?.total || 0,
        artworks: artworksRes.data?.total || 0,
        categories: categoriesRes.data?.length || 0,
        messages: messagesRes.data?.total || 0,
        announcements: announcementsRes.data?.total || 0,
        carousel: carouselRes.data?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>仪表盘</h2>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="工艺品总数"
              value={stats.artworks}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="分类数量"
              value={stats.categories}
              prefix={<TagsOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="留言数量"
              value={stats.messages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="公告数量"
              value={stats.announcements}
              prefix={<NotificationOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card>
            <Statistic
              title="轮播图数量"
              value={stats.carousel}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="系统说明" style={{ marginTop: '24px' }}>
        <p>欢迎使用艺术品网络展示管理系统！</p>
        <p>该系统包含以下功能模块：</p>
        <ul>
          <li><strong>用户管理</strong>：管理系统用户</li>
          <li><strong>工艺品管理</strong>：管理工艺品信息</li>
          <li><strong>分类管理</strong>：管理工艺品分类</li>
          <li><strong>留言板管理</strong>：管理用户留言</li>
          <li><strong>轮播图管理</strong>：管理首页轮播图</li>
          <li><strong>公告管理</strong>：管理系统公告</li>
        </ul>
      </Card>
    </div>
  );
};

export default Dashboard;
