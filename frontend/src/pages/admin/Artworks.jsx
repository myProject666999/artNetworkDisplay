import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Tag, Space, Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CommentOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const { TextArea } = Input;

const Artworks = () => {
  const [loading, setLoading] = useState(false);
  const [artworks, setArtworks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [comments, setComments] = useState([]);
  const [searchCategory, setSearchCategory] = useState(undefined);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    fetchArtworks();
    fetchCategories();
  }, [page, pageSize]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (searchCategory) params.category_id = searchCategory;
      if (searchKeyword) params.keyword = searchKeyword;
      
      const res = await api.get('/admin/artworks', { params });
      setArtworks(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch artworks:', error);
      message.error('获取工艺品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchArtworks();
  };

  const handleAdd = () => {
    setEditingArtwork(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingArtwork(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      price: record.price,
      image: record.image,
      category_id: record.category_id,
      artist: record.artist,
      year: record.year,
      material: record.material,
      dimensions: record.dimensions,
      status: record.status
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/artworks/${id}`);
      message.success('删除成功');
      fetchArtworks();
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleViewComments = async (record) => {
    setSelectedArtwork(record);
    try {
      const res = await api.get(`/admin/artworks/${record.id}/comments`);
      setComments(res.data || []);
      setCommentModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      message.error('获取评论失败');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/admin/artworks/${selectedArtwork.id}/comments/${commentId}`);
      message.success('评论删除成功');
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      message.error('删除评论失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingArtwork) {
        await api.put(`/admin/artworks/${editingArtwork.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/admin/artworks', values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchArtworks();
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : '未知';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image) => image ? (
        <Image width={80} height={60} src={image} style={{ objectFit: 'cover' }} />
      ) : '-'
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '分类',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId) => getCategoryName(categoryId)
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price}`
    },
    {
      title: '艺术家',
      dataIndex: 'artist',
      key: 'artist'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '上架' : '下架'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD')
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<CommentOutlined />}
            onClick={() => handleViewComments(record)}
          >
            评论
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该工艺品吗？"
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
        <h2 style={{ margin: 0 }}>工艺品管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加工艺品
        </Button>
      </div>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
          <Select
            placeholder="选择分类"
            value={searchCategory}
            onChange={setSearchCategory}
            style={{ width: 200 }}
            allowClear
          >
            {categories.map(cat => (
              <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
            ))}
          </Select>
          <Input
            placeholder="关键词搜索"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={handleSearch}>搜索</Button>
        </div>

        <Table
          columns={columns}
          dataSource={artworks}
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
        title={editingArtwork ? '编辑工艺品' : '添加工艺品'}
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
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(cat => (
                <Select.Option key={cat.id} value={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入价格"
              min={0}
              precision={2}
            />
          </Form.Item>
          <Form.Item
            name="image"
            label="图片URL"
          >
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="artist"
              label="艺术家"
            >
              <Input placeholder="请输入艺术家" />
            </Form.Item>
            <Form.Item
              name="year"
              label="年份"
            >
              <InputNumber style={{ width: '100%' }} placeholder="请输入年份" />
            </Form.Item>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="material"
              label="材质"
            >
              <Input placeholder="请输入材质" />
            </Form.Item>
            <Form.Item
              name="dimensions"
              label="尺寸"
            >
              <Input placeholder="请输入尺寸" />
            </Form.Item>
          </div>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Select.Option value={1}>上架</Select.Option>
              <Select.Option value={0}>下架</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`评论列表 - ${selectedArtwork?.title}`}
        open={commentModalVisible}
        onCancel={() => setCommentModalVisible(false)}
        footer={null}
        width={700}
      >
        {comments.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>暂无评论</p>
        ) : (
          comments.map(comment => (
            <Card key={comment.id} size="small" style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p><strong>{comment.user?.nickname || '用户'}</strong></p>
                  <p style={{ margin: '8px 0' }}>{comment.content}</p>
                  <p style={{ color: '#999', fontSize: '12px' }}>
                    {dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
                <Popconfirm
                  title="确定要删除该评论吗？"
                  onConfirm={() => handleDeleteComment(comment.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger size="small">删除</Button>
                </Popconfirm>
              </div>
            </Card>
          ))
        )}
      </Modal>
    </div>
  );
};

export default Artworks;
