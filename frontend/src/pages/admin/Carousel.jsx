import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, InputNumber, message, Popconfirm, Space, Tag, Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../api';
import dayjs from 'dayjs';

const Carousel = () => {
  const [loading, setLoading] = useState(false);
  const [carousels, setCarousels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCarousels();
  }, []);

  const fetchCarousels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/carousel');
      setCarousels(res.data || []);
    } catch (error) {
      console.error('Failed to fetch carousels:', error);
      message.error('获取轮播图列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCarousel(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingCarousel(record);
    form.setFieldsValue({
      title: record.title,
      image: record.image,
      link: record.link,
      sort: record.sort,
      status: record.status
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/carousel/${id}`);
      message.success('删除成功');
      fetchCarousels();
    } catch (error) {
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingCarousel) {
        await api.put(`/admin/carousel/${editingCarousel.id}`, values);
        message.success('更新成功');
      } else {
        await api.post('/admin/carousel', values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchCarousels();
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
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 150,
      render: (image) => image ? (
        <Image width={120} height={60} src={image} style={{ objectFit: 'cover' }} />
      ) : '-'
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      ellipsis: true
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '显示' : '隐藏'}
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
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该轮播图吗？"
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
        <h2 style={{ margin: 0 }}>轮播图管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加轮播图
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={carousels}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingCarousel ? '编辑轮播图' : '添加轮播图'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
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
            name="image"
            label="图片URL"
            rules={[{ required: true, message: '请输入图片URL' }]}
          >
            <Input placeholder="请输入图片URL" />
          </Form.Item>
          <Form.Item
            name="link"
            label="跳转链接"
          >
            <Input placeholder="请输入跳转链接（可选）" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="数字越小越靠前"
              min={0}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <select style={{ width: '100%', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d9d9d9' }}>
              <option value={1}>显示</option>
              <option value={0}>隐藏</option>
            </select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Carousel;
