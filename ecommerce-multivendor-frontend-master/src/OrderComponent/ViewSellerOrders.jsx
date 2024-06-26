import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Button, Modal } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

const ViewSellerOrders = () => {
  const api_Url = process.env.REACT_APP_API_URL;
  const seller = JSON.parse(sessionStorage.getItem("active-seller"));
  const [orders, setOrders] = useState([]);
  const seller_jwtToken = sessionStorage.getItem("seller-jwtToken");
  const [orderId, setOrderId] = useState("");
  const [tempOrderId, setTempOrderId] = useState("");
  const [assignOrderId, setAssignOrderId] = useState("");
  const [deliveryPersonId, setDeliveryPersonId] = useState("");
  const [allDelivery, setAllDelivery] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const retrieveAllorders = useCallback(async () => {
    const response = await axios.get(
      `${api_Url}/api/order/fetch/seller-wise?sellerId=` + seller.id,
      {
        headers: {
          Authorization: "Bearer " + seller_jwtToken,
        },
      }
    );
    return response.data;
     // eslint-disable-next-line
  }, [seller.id, seller_jwtToken]);

  useEffect(() => {
    const retrieveOrdersById = async () => {
      const response = await axios.get(
        `${api_Url}/api/order/fetch?orderId=` + orderId
      );
      console.log(response.data);
      return response.data;
    };

    const getAllOrders = async () => {
      let allOrders;
      if (orderId) {
        allOrders = await retrieveOrdersById();
      } else {
        allOrders = await retrieveAllorders();
      }

      if (allOrders) {
        setOrders(allOrders.orders);
      }
    };

    const getAllUsers = async () => {
      const response = await axios.get(
        `${api_Url}/api/user/fetch/seller/delivery-person?sellerId=` +
          seller.id,
        {
          headers: {
            Authorization: "Bearer " + seller_jwtToken,
          },
        }
      );
      setAllDelivery(response.data.users);
    };

    getAllOrders();
    getAllUsers();
     // eslint-disable-next-line
  }, [orderId, retrieveAllorders, seller.id, seller_jwtToken]);

  const formatDateFromEpoch = (epochTime) => {
    const date = new Date(Number(epochTime));
    return date.toLocaleString();
  };

  const searchOrderById = (e) => {
    e.preventDefault();
    setOrderId(tempOrderId);
  };

  const assignDelivery = (orderId, e) => {
    setAssignOrderId(orderId);
    handleShow();
  };

  const assignToDelivery = (orderId, e) => {
    let data = { orderId: assignOrderId, deliveryId: deliveryPersonId };

    fetch(`${api_Url}/api/order/assign/delivery-person`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + seller_jwtToken,
      },
      body: JSON.stringify(data),
    })
      .then((result) => {
        result.json().then((res) => {
          const toastOptions = {
            position: "top-center",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          };
          if (res.success) {
            toast.success(res.responseMessage, toastOptions);
            setOrders(res.orders);
            setTimeout(() => {
              window.location.reload(true);
            }, 2000);
          } else {
            toast.error(res.responseMessage || "It seems server is down", toastOptions);
            setTimeout(() => {
              window.location.reload(true);
            }, 2000);
          }
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error("It seems server is down", {
          position: "top-center",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        setTimeout(() => {
          window.location.reload(true);
        }, 2000);
      });
  };
  return (
    <div className="mt-3">
      <div
        className="card form-card ms-2 me-2 mb-5 custom-bg shadow-lg"
        style={{
          height: "40rem",
        }}
      >
        <div
          className="card-header custom-bg-text text-center bg-color"
          style={{
            borderRadius: "1em",
            height: "50px",
          }}
        >
          <h2>Seller Orders</h2>
        </div>
        <div
          className="card-body"
          style={{
            overflowY: "auto",
          }}
        >
          <form className="row g-3">
            <div className="col-auto">
              <input
                type="text"
                className="form-control"
                id="inputPassword2"
                placeholder="Enter Order Id..."
                onChange={(e) => setTempOrderId(e.target.value)}
                value={tempOrderId}
              />
            </div>
            <div className="col-auto">
              <button
                type="submit"
                className="btn bg-color custom-bg-text mb-3"
                onClick={searchOrderById}
              >
                Search
              </button>
            </div>
          </form>

          <div className="table-responsive">
            <table className="table table-hover text-color text-center">
              <thead className="table-bordered border-color bg-color custom-bg-text">
                <tr>
                  <th scope="col">Order Id</th>
                  <th scope="col">Product</th>
                  <th scope="col">Product Name</th>
                  <th scope="col">Category</th>
                  <th scope="col">Seller</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Order Time</th>
                  <th scope="col">Order Status</th>
                  <th scope="col">Delivery Person</th>
                  <th scope="col">Delivery Contact</th>
                  <th scope="col">Delivery Time</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  return (
                    <tr key={order.orderId}>
                      <td>
                        <b>{order.orderId}</b>
                      </td>
                      <td>
                        <img
                          src={
                            `${api_Url}/api/product/` +
                            order.product.image1
                          }
                          className="img-fluid"
                          alt="product_pic"
                          style={{
                            maxWidth: "90px",
                          }}
                        />
                      </td>
                      <td>
                        <b>{order.product.name}</b>
                      </td>
                      <td>
                        <b>{order.product.category ? order.product.category.name : "No Category"}</b>
                      </td>
                      <td>
                        <b>{order.product.seller.firstName}</b>
                      </td>
                      <td>
                        <b>{order.product.price}</b>
                      </td>
                      <td>
                        <b>{order.quantity}</b>
                      </td>
                      <td>
                        <b>{order.user.firstName}</b>
                      </td>
                      <td>
                        <b>{formatDateFromEpoch(order.orderTime)}</b>
                      </td>
                      <td>
                        <b>{order.status}</b>
                      </td>
                      <td>
                        {order.deliveryPerson ? (
                          <b>{order.deliveryPerson.firstName}</b>
                        ) : (
                          <b className="text-danger">Pending</b>
                        )}
                      </td>
                      <td>
                        {order.deliveryPerson ? (
                          <b>{order.deliveryPerson.phoneNo}</b>
                        ) : (
                          <b className="text-danger">Pending</b>
                        )}
                      </td>
                      <td>
                        {order.deliveryDate ? (
                          <b>{order.deliveryDate + " " + order.deliveryTime}</b>
                        ) : (
                          <b className="text-danger">Processing</b>
                        )}
                      </td>
                      <td>
                        {order.deliveryPerson ? (
                          <b>Delivery Assigned</b>
                        ) : (
                          <button
                            className="btn btn-sm bg-color custom-bg-text ms-2"
                            variant="primary"
                            onClick={() => assignDelivery(order.orderId)}
                          >
                            Assign Delivery
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton className="bg-color custom-bg-text">
          <Modal.Title
            style={{
              borderRadius: "1em",
            }}
          >
            Assign To Delivery Person
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="ms-3 mt-3 mb-3 me-3">
            <form>
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  <b>Order Id</b>
                </label>
                <input type="text" className="form-control" value={assignOrderId} />
              </div>

              <div className=" mb-3">
                <label className="form-label">
                  <b>Delivery Person</b>
                </label>

                <select
                  name="deliveryPersonId"
                  onChange={(e) => setDeliveryPersonId(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select Delivery Person</option>

                  {allDelivery.map((delivery) => {
                    return (
                      <option key={delivery.id} value={delivery.id}>
                        {delivery.firstName + " " + delivery.lastName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="d-flex aligns-items-center justify-content-center mb-2">
                <button
                  type="submit"
                  onClick={() => assignToDelivery(assignOrderId)}
                  className="btn bg-color custom-bg-text"
                >
                  Assign
                </button>
              </div>

              <ToastContainer />
            </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ViewSellerOrders;
