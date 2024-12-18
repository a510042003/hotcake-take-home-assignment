import React, { useState, useEffect, useCallback } from "react";

// Order 型別定義
interface Order {
  id: number;
  type: "NORMAL" | "VIP";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETE";
}

// Bot 型別定義
interface Bot {
  id: number;
  status: "IDLE" | "PROCESSING";
  currentOrder?: Order;
}

const McDonaldsOrderSystem: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [orderCounter, setOrderCounter] = useState(1);

  const createNormalOrder = useCallback(() => {
    setOrders((prevOrders) => {
      const newOrder: Order = {
        id: orderCounter,
        type: "NORMAL",
        status: "PENDING",
      };
      const vipOrders = prevOrders.filter((o) => o.type === "VIP");
      const normalOrders = prevOrders.filter((o) => o.type === "NORMAL");
      return [...vipOrders, ...normalOrders, newOrder];
    });
    setOrderCounter((prev) => prev + 1);
  }, [orderCounter]);

  const createVIPOrder = useCallback(() => {
    setOrders((prevOrders) => {
      const newOrder: Order = {
        id: orderCounter,
        type: "VIP",
        status: "PENDING",
      };
      const vipOrders = prevOrders.filter((o) => o.type === "VIP");
      const normalOrders = prevOrders.filter((o) => o.type === "NORMAL");
      return [...vipOrders, newOrder, ...normalOrders];
    });
    setOrderCounter((prev) => prev + 1);
  }, [orderCounter]);

  const addBot = useCallback(() => {
    setBots((prevBots) => {
      const newBot: Bot = {
        id: prevBots.length + 1,
        status: "IDLE",
      };
      return [...prevBots, newBot];
    });
  }, []);

  // 移除最新的烹飪機器人
  const removeBot = useCallback(() => {
    setBots((prevBots) => {
      return prevBots.slice(0, -1);
    });
  }, []);

  useEffect(() => {
    const idleBots = bots.filter((bot) => bot.status === "IDLE");
    const pendingOrders = orders.filter((order) => order.status === "PENDING");

    if (idleBots.length > 0 && pendingOrders.length > 0) {
      let availableBots = [...idleBots];
      let remainingOrders = [...pendingOrders];

      const ordersToProcess = remainingOrders.slice(0, availableBots.length);

      ordersToProcess.forEach((orderToProcess, index) => {
        const bot = availableBots[index];

        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderToProcess.id
              ? { ...order, status: "IN_PROGRESS" }
              : order
          )
        );

        setBots((prevBots) =>
          prevBots.map((b) =>
            b.id === bot.id
              ? { ...b, status: "PROCESSING", currentOrder: orderToProcess }
              : b
          )
        );

        setTimeout(() => {
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.id === orderToProcess.id
                ? { ...order, status: "COMPLETE" }
                : order
            )
          );

          setBots((prevBots) =>
            prevBots.map((b) =>
              b.id === bot.id
                ? { ...b, status: "IDLE", currentOrder: undefined }
                : b
            )
          );
        }, 10000);
      });
    }
  }, [orders, bots]);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">麥當勞訂單控制系統</h1>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={createNormalOrder}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          新增普通訂單
        </button>
        <button
          onClick={createVIPOrder}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          新增VIP訂單
        </button>
        <button
          onClick={addBot}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          +機器人
        </button>
        <button
          onClick={removeBot}
          disabled={bots.length === 0}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          -機器人
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">待處理區域</h2>
          {orders
            .filter((order) => order.status === "PENDING")
            .map((order) => (
              <div
                key={order.id}
                className={`p-2 m-1 rounded ${
                  order.type === "VIP" ? "bg-yellow-100" : "bg-blue-100"
                }`}
              >
                訂單 #{order.id} ({order.type})
              </div>
            ))}
        </div>

        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">處理中區域</h2>
          {orders
            .filter((order) => order.status === "IN_PROGRESS")
            .map((order) => (
              <div
                key={order.id}
                className={`p-2 m-1 rounded ${
                  order.type === "VIP" ? "bg-yellow-200" : "bg-blue-200"
                }`}
              >
                訂單 #{order.id} ({order.type})
              </div>
            ))}
        </div>

        <div className="border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">已完成區域</h2>
          {orders
            .filter((order) => order.status === "COMPLETE")
            .map((order) => (
              <div
                key={order.id}
                className={`p-2 m-1 rounded ${
                  order.type === "VIP" ? "bg-yellow-300" : "bg-blue-300"
                }`}
              >
                訂單 #{order.id} ({order.type})
              </div>
            ))}
        </div>
      </div>

      <div className="border rounded p-4 mt-4">
        <h2 className="text-xl font-semibold mb-2">機器人狀態</h2>
        {bots.map((bot) => (
          <div
            key={bot.id}
            className={`p-2 m-1 rounded ${
              bot.status === "PROCESSING" ? "bg-green-200" : "bg-gray-100"
            }`}
          >
            機器人 #{bot.id} - {bot.status}
            {bot.currentOrder && `(處理訂單 #${bot.currentOrder.id})`}
          </div>
        ))}
      </div>
    </div>
  );
};

export default McDonaldsOrderSystem;
