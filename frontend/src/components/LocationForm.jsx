import React, { useState } from "react";
import api from "../api/api";

const LocationForm = ({ existingLocation, onSuccess }) => {
  const [form, setForm] = useState({
    name: existingLocation?.name || "",
    address: existingLocation?.address || "",
    latitude: existingLocation?.latitude || "",
    longitude: existingLocation?.longitude || "",
    phone: existingLocation?.phone || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (existingLocation) {
        await api.put(`/locations/${existingLocation.id}/`, form);
      } else {
        await api.post("/locations/", form);
      }
      onSuccess();
      setForm({ name: "", address: "", latitude: "", longitude: "", phone: "" });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input name="address" placeholder="Address" value={form.address} onChange={handleChange} />
      <input name="latitude" placeholder="Latitude" value={form.latitude} onChange={handleChange} />
      <input name="longitude" placeholder="Longitude" value={form.longitude} onChange={handleChange} />
      <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
      <button type="submit">{existingLocation ? "Update" : "Create"}</button>
    </form>
  );
};

export default LocationForm;
