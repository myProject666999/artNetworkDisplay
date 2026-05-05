import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Space, Tag, Descriptions
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const Announcements = () => {
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAnnouncements();
  }, [page, pageSize]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (searchKeyword) params.keyword = searchKeyword;
      
      const res = await api.get('/admin/announcements', { params });
      setAnnouncements(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      message.error('获取公告列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchAnnouncements();
  };

  const handleAdd = () => {
    setEditingAnnouncement(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingAnnouncement(record);
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      author: record.author,
      is_top: record.is_top,
      status: record.status
    });
    setModalVisible(true);
  };

  const handleViewDetail = (record) => {
    setSelectedAnnouncement(record);
    setDetailModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/announcements/${id}`);
      message.success('删除成功');
      fetchAnnouncements();
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingAnnouncement) {
        await api.put(`/admin/announcements/${editingAnnouncement.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/admin/announcements', values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Submit error:', error);
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
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views'
    },
    {
      title: '置顶',
      dataIndex: 'is_top',
      key: 'is_top',
      render: (isTop) => (
        <Tag color={isTop ? 'orange' : 'default'}>
          {isTop ? '是' : '否'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '发布' : '草稿'}
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该公告吗？"
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
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>公告管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          发布公告
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Input
            placeholder="关键词搜索"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
        </div>

        <Table
          columns={columns}
          dataSource={announcements}
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
        title={editingAnnouncement ? '编辑公告' : '发布公告'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <TextArea rows={8} placeholder="请输入公告内容" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="author"
              label="作者"
              rules={[{ required: true, message: '请输入作者' }]}
            >
              <Input placeholder="请输入作者" />
            </Form.Item>
            <Form.Item
              name="is_top"
              label="是否置顶"
            >
              <select style={{ width: '100%', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d9d9d9' }}>
                <option value={0}>否</option>
                <option value={1}>是</option>
              </select>
            </Form.Item>
          </div>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <select style={{ width: '100%', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d9d9d9' }}>
              <option value={1}>发布</option>
              <option value={0}>草稿</option>
            </select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="公告详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedAnnouncement && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="标题" span={2}>
                {selectedAnnouncement.title}
              </Descriptions.Item>
              <Descriptions.Item label="作者">
                {selectedAnnouncement.author}
              </Descriptions.Item>
              <Descriptions.Item label="浏览量">
                {selectedAnnouncement.views}
              </Descriptions.Item>
              <Descriptions.Item label="是否置顶">
                <Tag color={selectedAnnouncement.is_top ? 'orange' : 'default'}>
                  {selectedAnnouncement.is_top ? '是' : '否'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedAnnouncement.status === 1 ? 'green' : 'red'}>
                  {selectedAnnouncement.status === 1 ? '发布' : '草稿'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {dayjs(selectedAnnouncement.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>
            
            <Card title="公告内容" style={{ marginTop: '20px' }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {selectedAnnouncement.content}
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Announcements;
