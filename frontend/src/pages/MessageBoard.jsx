import React, { useEffect, useState } from 'react';
import {
  Card, List, Avatar, Button, Form, Input, message,
  Pagination, Spin, Empty, Typography, Tag
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const MessageBoard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMessages();
  }, [page, pageSize]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/messages', {
        params: { page, page_size: pageSize }
      });
      setMessages(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!user) {
      message.info('请先登录');
      navigate('/login');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/messages', { content: values.content });
      message.success('留言发布成功');
      form.resetFields();
      setPage(1);
      fetchMessages();
    } catch (error) {
      message.error('留言发布失败');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handlePageChange = (newPage, newPageSize) => {
    setPage(newPage);
    setPageSize(newPageSize || pageSize);
  };

  return (
    <div>
      <Card title="发表留言" className="mb-24">
        {user ? (
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item
              name="content"
              rules={[{ required: true, message: '请输入留言内容' }]}
            >
              <TextArea rows={4} placeholder="写下您的留言..." />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                发表留言
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Text type="secondary">
              请先
              <a onClick={() => navigate('/login')} style={{ margin: '0 4px' }}>登录</a>
              后发表留言
            </Text>
          </div>
        )}
      </Card>

      <Card title="留言列表">
        {loading ? (
          <div className="loading-center">
            <Spin size="large" />
          </div>
        ) : messages.length > 0 ? (
          <div>
            <List
              dataSource={messages}
              renderItem={item => (
                <List.Item className="message-item">
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<UserOutlined />} src={item.user?.avatar} />
                    }
                    title={
                      <div>
                        <Text strong>{item.user?.nickname || item.user?.username || '匿名用户'}</Text>
                        <Text type="secondary" style={{ marginLeft: '12px', fontSize: '12px' }}>
                          {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ margin: '8px 0' }}>{item.content}</p>
                        {item.replies && item.replies.length > 0 && (
                          <div className="reply">
                            {item.replies.map((reply, idx) => (
                              <div key={idx}>
                                <Tag color="blue">管理员回复</Tag>
                                <Text>{reply.content}</Text>
                                <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                                  {dayjs(reply.created_at).format('MM-DD HH:mm')}
                                </Text>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            {total > 10 && (
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
            )}
          </div>
        ) : (
          <Empty description="暂无留言，快来发表第一条留言吧！" />
        )}
      </Card>
    </div>
  );
};

export default MessageBoard;
