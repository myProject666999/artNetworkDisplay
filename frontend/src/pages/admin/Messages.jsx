import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Descriptions
} from 'antd';
import { DeleteOutlined, EyeOutlined, MessageOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const Messages = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyForm] = Form.useForm();

  useEffect(() => {
    fetchMessages();
  }, [page, pageSize]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/messages', {
        params: { page, page_size: pageSize }
      });
      setMessages(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      message.error('获取留言列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (record) => {
    setSelectedMessage(record);
    setDetailModalVisible(true);
  };

  const handleReply = (record) => {
    setSelectedMessage(record);
    replyForm.resetFields();
    setReplyModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/messages/${id}`);
      message.success('删除成功');
      fetchMessages();
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleSubmitReply = async () => {
    try {
      const values = await replyForm.validateFields();
      await api.post(`/admin/messages/${selectedMessage.id}/reply`, values);
      message.success('回复成功');
      setReplyModalVisible(false);
      fetchMessages();
    } catch (error) {
      console.error('Reply error:', error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.nickname || user?.username || '未知用户'
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'orange'}>
          {status === 1 ? '已回复' : '待回复'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<MessageOutlined />}
            onClick={() => handleReply(record)}
          >
            回复
          </Button>
          <Popconfirm
            title="确定要删除该留言吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>留言板管理</h2>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={messages}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            }
          }}
        />
      </Card>

      <Modal
        title="留言详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedMessage && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="用户">
                {selectedMessage.user?.nickname || selectedMessage.user?.username}
              </Descriptions.Item>
              <Descriptions.Item label="留言内容">
                {selectedMessage.content}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedMessage.status === 1 ? 'green' : 'orange'}>
                  {selectedMessage.status === 1 ? '已回复' : '待回复'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="留言时间">
                {dayjs(selectedMessage.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
            
            {selectedMessage.replies && selectedMessage.replies.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4>回复记录：</h4>
                {selectedMessage.replies.map((reply, index) => (
                  <Card key={reply.id} size="small" style={{ marginBottom: '12px' }}>
                    <p><strong>{reply.replier}</strong> 回复：</p>
                    <p>{reply.content}</p>
                    <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                      {dayjs(reply.created_at).format('YYYY-MM-DD HH:mm')}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="回复留言"
        open={replyModalVisible}
        onOk={handleSubmitReply}
        onCancel={() => setReplyModalVisible(false)}
        okText="发送"
        cancelText="取消"
      >
        {selectedMessage && (
          <div>
            <p><strong>原留言：</strong>{selectedMessage.content}</p>
            <Form form={replyForm} layout="vertical" style={{ marginTop: '16px' }}>
              <Form.Item
                name="replier"
                label="回复者"
                rules={[{ required: true, message: '请输入回复者名称' }]}
              >
                <Input placeholder="请输入回复者名称" />
              </Form.Item>
              <Form.Item
                name="content"
                label="回复内容"
                rules={[{ required: true, message: '请输入回复内容' }]}
              >
                <TextArea rows={4} placeholder="请输入回复内容" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
