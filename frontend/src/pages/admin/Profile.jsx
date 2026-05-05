import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, Button, message, Avatar, Row, Col, Tabs, Tag
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const AdminProfile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        nickname: user.nickname || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleProfileSubmit = async (values) => {
    setLoading(true);
    try {
      await api.put('/user/profile', values);
      await refreshUser();
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('个人信息更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的新密码不一致');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/user/password', {
        old_password: values.oldPassword,
        new_password: values.newPassword
      });
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error) {
      message.error(error.response?.data?.error || '密码修改失败');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    {
      key: 'profile',
      label: '个人信息',
      children: (
        <Card>
          <Row gutter={24}>
            <Col xs={24} md={6} style={{ textAlign: 'center' }}>
              <Avatar size={120} icon={<UserOutlined />} src={user?.avatar} />
              <div style={{ marginTop: '16px' }}>
                <h3>{user?.nickname || user?.username}</h3>
                <p style={{ color: '#999' }}>@{user?.username}</p>
                <p><Tag color="blue">管理员</Tag></p>
              </div>
            </Col>
            <Col xs={24} md={18}>
              <Form
                form={profileForm}
                onFinish={handleProfileSubmit}
                layout="vertical"
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="nickname"
                      label="昵称"
                      rules={[{ required: true, message: '请输入昵称' }]}
                    >
                      <Input placeholder="请输入昵称" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="邮箱"
                      rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '请输入有效的邮箱地址' }
                      ]}
                    >
                      <Input placeholder="请输入邮箱" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="手机号"
                    >
                      <Input placeholder="请输入手机号" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    保存修改
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      )
    },
    {
      key: 'password',
      label: '修改密码',
      children: (
        <Card>
          <Form
            form={passwordForm}
            onFinish={handlePasswordSubmit}
            layout="vertical"
            style={{ maxWidth: 500 }}
          >
            <Form.Item
              name="oldPassword"
              label="原密码"
              rules={[{ required: true, message: '请输入原密码' }]}
            >
              <Input.Password placeholder="请输入原密码" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[
                { required: true, message: '请确认新密码' }
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={passwordLoading}>
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: '24px' }}>个人中心</h2>
      <Card>
        <Tabs items={tabs} />
      </Card>
    </div>
  );
};

export default AdminProfile;
