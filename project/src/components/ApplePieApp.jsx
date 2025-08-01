import { useState, useEffect } from 'react'
import { Card, Button, Form, Input, Rate, DatePicker, Select, Space, List, Statistic, Row, Col, Modal, message, Avatar } from 'antd'
import { PlusOutlined, EyeOutlined, EditOutlined, AppleOutlined } from '@ant-design/icons'
import { ApplePie } from '../entities/ApplePie'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select

function ApplePieApp() {
  const [pies, setPies] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingPie, setEditingPie] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadPies()
  }, [])

  const loadPies = async () => {
    setLoading(true)
    try {
      const response = await ApplePie.list()
      if (response.success) {
        setPies(response.data || [])
      }
    } catch (error) {
      message.error('Failed to load apple pies')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      const pieData = {
        ...values,
        dateEaten: values.dateEaten.format('YYYY-MM-DD')
      }
      
      const response = editingPie 
        ? await ApplePie.update(editingPie._id, pieData)
        : await ApplePie.create(pieData)
      
      if (response.success) {
        message.success(editingPie ? 'Pie updated successfully!' : 'Pie added successfully!')
        setModalVisible(false)
        setEditingPie(null)
        form.resetFields()
        loadPies()
      }
    } catch (error) {
      message.error('Failed to save pie')
    }
  }

  const openModal = (pie = null) => {
    setEditingPie(pie)
    if (pie) {
      form.setFieldsValue({
        ...pie,
        dateEaten: dayjs(pie.dateEaten)
      })
    } else {
      form.resetFields()
    }
    setModalVisible(true)
  }

  const getStats = () => {
    const totalPies = pies.length
    const avgRating = pies.length > 0 
      ? (pies.reduce((sum, pie) => sum + pie.rating, 0) / pies.length).toFixed(1)
      : 0
    const favoriteLocation = pies.length > 0
      ? pies.reduce((acc, pie) => {
          acc[pie.location] = (acc[pie.location] || 0) + 1
          return acc
        }, {})
      : {}
    
    const topLocation = Object.keys(favoriteLocation).length > 0
      ? Object.keys(favoriteLocation).reduce((a, b) => favoriteLocation[a] > favoriteLocation[b] ? a : b)
      : 'None'

    return { totalPies, avgRating, topLocation }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2 flex items-center justify-center gap-2">
            <AppleOutlined className="text-red-500" />
            Apple Pie Tracker
          </h1>
          <p className="text-amber-600">Track every delicious slice of your apple pie journey!</p>
        </div>

        {/* Stats Cards */}
        <Row gutter={16} className="mb-8">
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-lg border-amber-200">
              <Statistic 
                title="Total Pies Eaten" 
                value={stats.totalPies}
                valueStyle={{ color: '#d97706' }}
                prefix={<AppleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-lg border-amber-200">
              <Statistic 
                title="Average Rating" 
                value={stats.avgRating}
                suffix="/ 5"
                valueStyle={{ color: '#ea580c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="text-center shadow-lg border-amber-200">
              <Statistic 
                title="Favorite Location" 
                value={stats.topLocation}
                valueStyle={{ color: '#c2410c', fontSize: '16px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Add New Pie Button */}
        <div className="text-center mb-6">
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            className="bg-amber-600 hover:bg-amber-700 border-amber-600"
          >
            Add New Apple Pie
          </Button>
        </div>

        {/* Pie List */}
        <Card title="Your Apple Pie Collection" className="shadow-lg border-amber-200">
          <List
            loading={loading}
            dataSource={pies}
            locale={{ emptyText: 'No apple pies yet! Add your first one above.' }}
            renderItem={(pie) => (
              <List.Item
                actions={[
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => openModal(pie)}
                  >
                    Edit
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      size={64} 
                      style={{ backgroundColor: '#f59e0b' }}
                      icon={<AppleOutlined />}
                    />
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-amber-800">{pie.name}</span>
                      <Rate disabled value={pie.rating} className="text-sm" />
                    </div>
                  }
                  description={
                    <div className="space-y-1">
                      <div><strong>Flavor:</strong> {pie.flavor || 'Classic'}</div>
                      <div><strong>Location:</strong> {pie.location || 'Unknown'}</div>
                      <div><strong>Date:</strong> {dayjs(pie.dateEaten).format('MMM DD, YYYY')}</div>
                      {pie.notes && <div><strong>Notes:</strong> {pie.notes}</div>}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={editingPie ? 'Edit Apple Pie' : 'Add New Apple Pie'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false)
            setEditingPie(null)
            form.resetFields()
          }}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              rating: 5,
              dateEaten: dayjs()
            }}
          >
            <Form.Item
              name="name"
              label="Pie Name/Description"
              rules={[{ required: true, message: 'Please enter the pie name!' }]}
            >
              <Input placeholder="e.g., Grandma's Apple Pie, McDonald's Apple Pie" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="flavor"
                  label="Flavor"
                >
                  <Select placeholder="Select flavor">
                    <Option value="Classic">Classic</Option>
                    <Option value="Caramel Apple">Caramel Apple</Option>
                    <Option value="Cinnamon">Cinnamon</Option>
                    <Option value="Dutch Apple">Dutch Apple</Option>
                    <Option value="French Apple">French Apple</Option>
                    <Option value="Apple Crumb">Apple Crumb</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="rating"
                  label="Rating"
                  rules={[{ required: true, message: 'Please rate the pie!' }]}
                >
                  <Rate />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="location"
                  label="Location"
                >
                  <Input placeholder="e.g., Home, Local Bakery" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="dateEaten"
                  label="Date Eaten"
                  rules={[{ required: true, message: 'Please select the date!' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="notes"
              label="Notes"
            >
              <TextArea 
                rows={3} 
                placeholder="How was it? Any special memories or details..."
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button onClick={() => setModalVisible(false)}>
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  className="bg-amber-600 hover:bg-amber-700 border-amber-600"
                >
                  {editingPie ? 'Update Pie' : 'Add Pie'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  )
}

export default ApplePieApp