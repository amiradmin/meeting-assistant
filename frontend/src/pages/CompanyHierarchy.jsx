// src/pages/CompanyHierarchy.jsx
import React, { useEffect, useState } from "react";
import { Card, Button, Collapse, Spinner } from "react-bootstrap";
import api from "../api/api";

const TreeNode = ({ node, level = 0 }) => {
  const [open, setOpen] = useState(false);

  const hasChildren = node.factories || node.plants || node.sections;

  return (
    <div style={{ marginLeft: level * 20 }}>
      <div className="d-flex align-items-center mb-1">
        {hasChildren && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setOpen(!open)}
            style={{ textDecoration: "none" }}
          >
            {open ? "▼" : "▶"}
          </Button>
        )}
        <strong>{node.name}</strong>
      </div>

      <Collapse in={open}>
        <div>
          {node.factories &&
            node.factories.map((f) => (
              <TreeNode key={f.id} node={f} level={level + 1} />
            ))}

          {node.plants &&
            node.plants.map((p) => (
              <TreeNode key={p.id} node={p} level={level + 1} />
            ))}

          {node.sections &&
            node.sections.map((s) => (
              <TreeNode key={s.id} node={s} level={level + 1} />
            ))}
        </div>
      </Collapse>
    </div>
  );
};

const CompanyHierarchy = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("api/company-hierarchy")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner animation="border" />;

  if (!data || !data.name) return <p>هیچ داده‌ای موجود نیست</p>;

  return (
    <Card className="p-3">
      <h3 className="mb-3">{data.name}</h3>
      {data.factories?.map((factory) => (
        <TreeNode key={factory.id} node={factory} level={1} />
      ))}
    </Card>
  );
};

export default CompanyHierarchy;
