// src/Component1.jsx

import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import Papa from 'papaparse';
import './styles/Component1.css'

const Component1 = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    Papa.parse('/salaries.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsedData = processData(results.data);
        setData(parsedData);
      }
    });
  }, []);

  const processData = (data) => {
    const yearMap = {};

    data.forEach((row) => {
      const year = parseInt(row.work_year, 10);
      const salary = parseFloat(row.salary_in_usd);

      if (!yearMap[year]) {
        yearMap[year] = { totalJobs: 0, totalSalary: 0, count: 0 };
      }

      yearMap[year].totalJobs += 1;
      yearMap[year].totalSalary += salary;
      yearMap[year].count += 1;
    });

    return Object.keys(yearMap).map(year => {
      const totalJobs = yearMap[year].totalJobs;
      const totalSalary = yearMap[year].totalSalary;
      const count = yearMap[year].count;
      
      // Calculate averageSalary, or set it to 0 if count is 0 to avoid NaN
      const averageSalary = count > 0 ? (totalSalary / count).toFixed(2) : 0;

      return {
        year: parseInt(year, 10),
        totalJobs,
        averageSalary,
      };
    }).filter(row => !isNaN(row.averageSalary)); // Filter out rows where averageSalary is NaN
  };

  const columns = [
    {
      title: 'Year',
      dataIndex: 'year',
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: 'Total Jobs',
      dataIndex: 'totalJobs',
      sorter: (a, b) => a.totalJobs - b.totalJobs,
    },
    {
      title: 'Average Salary (USD)',
      dataIndex: 'averageSalary',
      sorter: (a, b) => a.averageSalary - b.averageSalary,
    },
  ];

  return (
    <div className="Component1">
      <Table columns={columns} dataSource={data} rowKey="year" />
    </div>
  );
};

export default Component1;
