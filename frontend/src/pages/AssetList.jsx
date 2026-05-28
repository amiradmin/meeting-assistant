import React, { useEffect, useState } from "react";
import axios from "axios";

const AssetList = () => {
  const [machines, setMachines] = useState([]);
  const [lines, setLines] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [activeTab, setActiveTab] = useState("machines");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [machinesRes, linesRes, sensorsRes] = await Promise.all([
          axios.get("http://192.168.150.10:8000/api/machines/"),
          axios.get("http://192.168.150.10:8000/api/lines/"),
          axios.get("http://192.168.150.10:8000/api/sensors/"),
        ]);
        setMachines(machinesRes.data);
        setLines(linesRes.data);
        setSensors(sensorsRes.data);
      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchData();
  }, []);

  const renderTable = () => {
    if (activeTab === "machines") {
      return (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>نام ماشین</th>
              <th>خط تولید</th>
              <th>وضعیت</th>
              <th>آخرین نگهداری</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.line_name}</td>
                <td>{m.status}</td>
                <td>{m.last_maintenance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === "lines") {
      return (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>نام خط تولید</th>
              <th>محل</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id}>
                <td>{l.name}</td>
                <td>{l.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === "sensors") {
      return (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>نام سنسور</th>
              <th>ماشین</th>
              <th>نوع</th>
              <th>مقدار</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.machine_name}</td>
                <td>{s.type}</td>
                <td>{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="container mt-3">
      <h2 className="mb-3">لیست تجهیزات</h2>

      {/* Tabs */}
      <div className="btn-group mb-3">
        <button
          className={`btn btn-sm ${activeTab === "machines" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("machines")}
        >
          ماشین‌آلات
        </button>
        <button
          className={`btn btn-sm ${activeTab === "lines" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("lines")}
        >
          خطوط تولید
        </button>
        <button
          className={`btn btn-sm ${activeTab === "sensors" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setActiveTab("sensors")}
        >
          سنسورها
        </button>
      </div>

      {/* Table */}
      <div>{renderTable()}</div>
    </div>
  );
};

export default AssetList;
