import React from 'react';
import { Layout as AntLayout, Menu, Button, Dropdown, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeOutlined,
  ShoppingOutlined,
  NotificationOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  StarOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = AntLayout;

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/artworks')) return 'artworks';
    if (path.startsWith('/announcements')) return 'announcements';
    if (path === '/messages') return 'messages';
    if (path === '/profile') return 'profile';
    if (path === '/favorites') return 'favorites';
    return 'home';
  };

  const menuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '首页', onClick: () => navigate('/') },
    { key: 'artworks', icon: <ShoppingOutlined />, label: '工艺品', onClick: () => navigate('/artworks') },
    { key: 'announcements', icon: <NotificationOutlined />, label: '公告信息', onClick: () => navigate('/announcements') },
    { key: 'messages', icon: <MessageOutlined />, label: '留言板', onClick: () => navigate('/messages') },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心', onClick: () => navigate('/profile') },
    { key: 'favorites', icon: <StarOutlined />, label: '我的收藏', onClick: () => navigate('/favorites') },
    { type: 'divider' },
    ...(isAdmin() ? [{
      key: 'admin',
      icon: <SettingOutlined />,
      label: '管理后台',
      onClick: () => navigate('/admin')
    }] : []),
    ...(isAdmin() ? [{ type: 'divider' }] : []),
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: handleLogout }
  ];

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <AntLayout className="user-layout">
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div 
            style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#1890ff',
              cursor: 'pointer',
              marginRight: '32px'
            }}
            onClick={() => navigate('/')}
          >
            艺术品展示系统
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            style={{ borderBottom: 'none' }}
          />
        </div>
        <div>
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} src={user.avatar} />
                <span style={{ marginLeft: '8px' }}>{user.nickname || user.username}</span>
              </div>
            </Dropdown>
          ) : (
            <div>
              <Button type="link" onClick={() => navigate('/login')}>
                <LoginOutlined /> 登录
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                注册
              </Button>
            </div>
          )}
        </div>
      </Header>
      <Content>
        <Outlet />
      </Content>
      <Footer>
        艺术品网络展示管理系统 ©2024 Created by Art Network Display
      </Footer>
    </AntLayout>
  );
};

export default Layout;
