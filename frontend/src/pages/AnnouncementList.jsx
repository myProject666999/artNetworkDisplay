import React, { useEffect, useState } from 'react';
import {
  Card, List, Tag, Input, Pagination, Spin, Empty, Typography, Row, Col
} from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncements();
  }, [page, pageSize]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...(keyword && { keyword })
      };
      const res = await api.get('/announcements', { params });
      setAnnouncements(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setKeyword(value);
    setPage(1);
    setTimeout(() => fetchAnnouncements(), 0);
  };

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize || pageSize);
  };

  return (
    <div>
      <Card className="mb-24">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Search
              placeholder="搜索公告标题..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={handleSearch}
              enterButton
              allowClear
              style={{ maxWidth: 400 }}
            />
          </Col>
        </Row>
      </Card>

      {loading ? (
        <div className="loading-center">
          <Spin size="large" />
        </div>
      ) : announcements.length > 0 ? (
        <Card>
          <List
            itemLayout="vertical"
            dataSource={announcements}
            renderItem={item => (
              <List.Item
                className="announcement-card"
                onClick={() => navigate(`/announcements/${item.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <List.Item.Meta
                  title={
                    <div>
                      {item.is_top && <Tag color="red" style={{ marginRight: '8px' }}>置顶</Tag>}
                      <Text strong style={{ fontSize: '16px' }}>{item.title}</Text>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: '8px' }}>
                      <Text type="secondary">
                        {item.author && `作者: ${item.author}`}
                        {item.author && ' | '}
                        浏览: {item.views}
                        {' | '}
                        发布时间: {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
              showTotal={(total) => `共 ${total} 条`}
            />
          </div>
        </Card>
      ) : (
        <Card>
          <Empty description="暂无公告" />
        </Card>
      )}
    </div>
  );
};

export default AnnouncementList;
