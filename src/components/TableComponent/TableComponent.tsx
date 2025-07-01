import { useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  Alert,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import {
  addItem,
  editItem,
  deleteItem,
  setSearchQuery,
  type TableItem,
} from "../../store/tableSlice";
import styles from "./TableComponent.module.scss";
import type { RootState } from "../../store/store";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const { Column } = Table;

const TableComponent = () => {
  const dispatch = useDispatch();
  const { data, searchQuery } = useSelector((state: RootState) => state.table);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TableItem | null>(null);
  const [form] = Form.useForm();
  const [submitError, setSubmitError] = useState("");

  const filteredData = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const showModal = (item: TableItem | null = null) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item?.name || "",
      date: item?.date ? dayjs(item.date) : null,
      value: item?.value || undefined,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        name: values.name.trim(),
        date: dayjs(values.date).format("YYYY-MM-DD"),
        value: Number(values.value),
        id: editingItem?.id || Date.now().toString(),
      };

      if (editingItem) {
        dispatch(editItem(payload));
      } else {
        dispatch(addItem(payload));
      }

      setIsModalVisible(false);
      form.resetFields();
      setSubmitError("");
    } catch (error) {
      setSubmitError("Проверьте правильность заполнения формы");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSubmitError("");
  }

  const handleDelete = (id: string) => {
    dispatch(deleteItem(id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={styles.container}
    >
      <div className={styles.container}>
        <div className={styles.controls}>
          <Input
            placeholder="Поиск..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className={styles.search}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Добавить
          </Button>
        </div>
        <Table
          dataSource={filteredData}
          rowKey="id"
          className={styles.table}
          pagination={{
            pageSize: 4,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} записей`,
            position: ["bottomCenter"],
          }}
        >
          <Column
            title="Имя"
            dataIndex="name"
            key="name"
            sorter={(a: TableItem, b: TableItem) =>
              a.name.localeCompare(b.name)
            }
          />
          <Column
            title="Дата"
            dataIndex="date"
            key="date"
            sorter={(a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
            }
            render={(date: string) => dayjs(date).format("DD.MM.YYYY")}
          />
          <Column
            title="Значение"
            dataIndex="value"
            key="value"
            sorter={(a: TableItem, b: TableItem) => a.value - b.value}
          />
          <Column
            title="Действия"
            key="actions"
            render={(_: any, record: TableItem) => (
              <div className={styles.actions}>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => showModal(record)}
                  className={styles.editBtn}
                />
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(record.id)}
                  danger
                />
              </div>
            )}
          />
        </Table>

        <Modal
          title={editingItem ? "Редактировать запись" : "Добавить запись"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          className={styles.modal}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Имя"
              rules={[
                { required: true, message: "Обязательное поле" },
                {
                  validator: (_, value) => {
                    if (!/[a-zA-Zа-яА-ЯёЁ]/.test(value)) {
                      return Promise.reject(
                        "Должен содержать хотя бы одну букву"
                      );
                    }
                    if (value.trim().length < 2) {
                      return Promise.reject("Минимум 2 символа");
                    }
                    const isDuplicate = data.some(
                      (item) =>
                        item.name === value.trim() &&
                        item.id !== editingItem?.id
                    );
                    return isDuplicate
                      ? Promise.reject("Имя уже существует")
                      : Promise.resolve();
                  },
                },
                { max: 50, message: "Максимум 50 символов" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="date"
              label="Дата"
              normalize={(value) => value && dayjs(value)}
              getValueFromEvent={(date) => date}
              rules={[
                { required: true, message: "Обязательное поле" },
                {
                  validator: (_, value) =>
                    value && dayjs(value).isValid()
                      ? Promise.resolve()
                      : Promise.reject("Некорректная дата"),
                },
              ]}
            >
              <DatePicker
                format="DD.MM.YYYY"
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current > dayjs().endOf("day")
                }
              />
            </Form.Item>
            <Form.Item
              name="value"
              label="Значение"
              rules={[
                { required: true, message: "Обязательное поле" },
                {
                  pattern: /^\d+$/,
                  message: "Допустимы только целые положительные числа",
                },
                {
                  validator: (_, value) => {
                    if (isNaN(value)) {
                      return Promise.reject("Введите корректное число");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Form>
          {submitError && (
            <Alert
              message={submitError}
              type="error"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </Modal>
      </div>
    </motion.div>
  );
};

export default TableComponent;
