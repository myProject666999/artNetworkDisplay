import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.username, values.password);
    setLoading(false);
    
    if (result.success) {
      message.success('登录成功');
      navigate('/');
    } else {
      message.error(result.message);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <h1>登录</h1>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <span>还没有账号？</span>
            <Link to="/register"> 立即注册</Link>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'center', marginTop: '8px' }}>
            <span style={{ color: '#999', fontSize: '12px' }}>
              管理员默认账号: admin / admin123
            </span>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
