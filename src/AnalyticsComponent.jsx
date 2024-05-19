// src/AnalyticsComponent.jsx

import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const AnalyticsComponent = () => {
  const [data, setData] = useState([]);
  const [jobData, setJobData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    Papa.parse('/salaries.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const validData = results.data.filter(row => row.work_year && row.salary_in_usd && row.job_title);
        const parsedData = processData(validData);
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
        yearMap[year] = { totalJobs: 0, totalSalary: 0, count: 0, jobTitles: {} };
      }

      yearMap[year].totalJobs += 1;
      yearMap[year].totalSalary += salary;
      yearMap[year].count += 1;

      if (!yearMap[year].jobTitles[row.job_title]) {
        yearMap[year].jobTitles[row.job_title] = 0;
      }
      yearMap[year].jobTitles[row.job_title] += 1;
    });

    return Object.keys(yearMap).map(year => ({
      year: parseInt(year, 10),
      totalJobs: yearMap[year].totalJobs,
      averageSalary: (yearMap[year].totalSalary / yearMap[year].count).toFixed(2),
      jobTitles: yearMap[year].jobTitles
    }));
  };

  const handleRowClick = (record) => {
    setSelectedYear(record.year);
    setJobData(Object.entries(record.jobTitles).map(([title, count]) => ({ title, count })));
  };

  const mainColumns = [
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

  const jobColumns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
    },
    {
      title: 'Count',
      dataIndex: 'count',
    },
  ];

  const lineData = {
    labels: data.map(item => item.year),
    datasets: [
      {
        label: 'Total Jobs',
        data: data.map(item => item.totalJobs),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Total Jobs Over the Years',
      },
    },
  };

  return (
    <div className="AnalyticsComponent">
      <Line data={lineData} options={options} />
      <Table
        columns={mainColumns}
        dataSource={data}
        rowKey="year"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
        style={{ marginTop: 20 }}
      />
      {selectedYear && (
        <div className='thirddiv'>
          <h3 className='heading'>Job Titles and Counts for {selectedYear}</h3>
          <Table columns={jobColumns} dataSource={jobData} rowKey="title" />
        </div>
      )}
    </div>
  );
};

export default AnalyticsComponent;
