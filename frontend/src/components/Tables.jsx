import React from "react";

const Tables = () => {
  return (
    <div className="card shade h-100">
      <div className="card-body">
        <h5 className="card-title">اطلاعات در قالب جدول</h5>
        <hr />
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">ردیف</th>
              <th scope="col">نام</th>
              <th scope="col">نام خانوادگی</th>
              <th scope="col">منشن</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">1</th>
              <td>مارک</td>
              <td>لنترن</td>
              <td>@mdo</td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td>جیکوب</td>
              <td>رایان</td>
              <td>@fat</td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td>لری</td>
              <td>اسمیت</td>
              <td>@twitter</td>
            </tr>
            <tr>
              <th scope="row">4</th>
              <td>جیکوب</td>
              <td>رایان</td>
              <td>@fat</td>
            </tr>
            <tr>
              <th scope="row">5</th>
              <td>لری</td>
              <td>اسمیت</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tables;