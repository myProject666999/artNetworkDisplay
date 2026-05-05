import React from 'react';
import { Layout as AntLayout, Menu, Button, Dropdown, Avatar, theme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  TagsOutlined,
  MessageOutlined,
  PictureOutlined,
  NotificationOutlined,
  SettingOutlined,
  LogoutOutlined,
  HomeOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = AntLayout;

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin') return 'dashboard';
    if (path === '/admin/users') return 'users';
    if (path === '/admin/artworks') return 'artworks';
    if (path === '/admin/categories') return 'categories';
    if (path === '/admin/messages') return 'messages';
    if (path === '/admin/carousel') return 'carousel';
    if (path === '/admin/announcements') return 'announcements';
    if (path === '/admin/profile') return 'profile';
    return 'dashboard';
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘', onClick: () => navigate('/admin') },
    { key: 'users', icon: <UserOutlined />, label: '用户管理', onClick: () => navigate('/admin/users') },
    { key: 'artworks', icon: <ShoppingOutlined />, label: '工艺品管理', onClick: () => navigate('/admin/artworks') },
    { key: 'categories', icon: <TagsOutlined />, label: '分类管理', onClick: () => navigate('/admin/categories') },
    { key: 'messages', icon: <MessageOutlined />, label: '留言板管理', onClick: () => navigate('/admin/messages') },
    { key: 'carousel', icon: <PictureOutlined />, label: '轮播图管理', onClick: () => navigate('/admin/carousel') },
    { key: 'announcements', icon: <NotificationOutlined />, label: '公告管理', onClick: () => navigate('/admin/announcements') },
    { key: 'profile', icon: <SettingOutlined />, label: '个人中心', onClick: () => navigate('/admin/profile') },
  ];

  const userMenuItems = [
    { key: 'home', icon: <HomeOutlined />, label: '返回前台', onClick: () => navigate('/') },
    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true, onClick: handleLogout }
  ];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <AntLayout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible>
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          管理后台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          className="admin-menu"
        />
      </Sider>
      <AntLayout>
        <Header style={{ padding: '0 24px', background: colorBgContainer }}>
          <span style={{ fontSize: '18px', fontWeight: '500' }}>艺术品网络展示管理系统</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <span style={{ marginLeft: '8px' }}>{user?.nickname || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default AdminLayout;
