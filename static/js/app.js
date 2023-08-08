// URL for the JSON data
const url =
  "https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json";

// Use D3 to fetch data from the URL
async function loadJsonData() {
  return await d3
    .json(url)
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

// Function to create dropdown and horizontal bar chart
function createCharts(data) {
  // Extract necessary data from the loaded JSON
  const samples = data.samples;
  const metadata = data.metadata;

  // Get references to elements
  const dropdown = d3.select("#selDataset");
  const barChart = d3.select("#bar");
  const bubbleChart = d3.select("#bubble");

  // Create options in the dropdown menu
  dropdown
    .selectAll("option")
    .data(samples)
    .enter()
    .append("option")
    .attr("value", (d, i) => i)
    .text((d, i) => d.id);

  updateBarChart(samples, 0);
  updateBubbleChart(samples, 0);
  updateMetadata(metadata, 0);

  // Event listener for dropdown change
  dropdown.on("change", function () {
    const selectedIndex = +this.value; // Convert to number
    barChart.selectAll("svg").remove(); // Clear previous chart
    bubbleChart.selectAll("svg").remove(); // Clear previous chart
    updateBarChart(samples, selectedIndex);
    updateBubbleChart(samples, selectedIndex);
    updateMetadata(metadata, selectedIndex);
  });
}

// Function to update the bar chart based on selected sample
function updateBarChart(samples, sampleIndex) {
  // Get reference to bar chart element
  const barChart = d3.select("#bar");

  // Extract OTU data from the selected sample (user can change it from the UI)
  const selectedSample = samples[sampleIndex];
  const otuIds = selectedSample.otu_ids.slice(0, 10);
  const sampleValues = selectedSample.sample_values.slice(0, 10);
  const otuLabels = selectedSample.otu_labels.slice(0, 10);

  // Create a horizontal bar chart
  const barChartSvg = barChart
    .append("svg")
    .attr("width", 500)
    .attr("height", 400);

  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const width = 500 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = barChartSvg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(sampleValues)])
    .range([0, width]);

  const y = d3.scaleBand().domain(otuIds).range([0, height]).padding(0.1);

  svg
    .selectAll(".bar")
    .data(sampleValues)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", 0)
    .attr("y", (d, i) => y(otuIds[i]))
    .attr("width", (d) => x(d))
    .attr("height", y.bandwidth())
    .attr("fill", "steelblue")
    .append("title")
    .text((d, i) => otuLabels[i]);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y).tickFormat((i) => `OTU ${i}`));

  // Add hovertext using otu_labels
  svg.append("title").text((d, i) => otuLabels[i]);
}

// Function to update the bubble chart based on selected sample
function updateBubbleChart(samples, sampleIndex) {
  // Get reference to bubble chart element
  const bubbleChart = d3.select("#bubble");

  const selectedSample = samples[sampleIndex];

  const bubbleChartSvg = bubbleChart
    .append("svg")
    .attr("width", 1000)
    .attr("height", 1000);

  const margin = { top: 80, right: 20, bottom: 60, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = bubbleChartSvg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleLinear()
    .domain(d3.extent(selectedSample.otu_ids))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(selectedSample.sample_values)])
    .range([height, 0]);

  const color = d3
    .scaleOrdinal()
    .domain(selectedSample.otu_ids)
    .range(d3.schemeCategory10);

  const size = d3
    .scaleLinear()
    .domain(d3.extent(selectedSample.sample_values))
    .range([5, 50]);

  svg
    .selectAll("circle")
    .data(selectedSample.otu_ids)
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d))
    .attr("cy", (d, i) => y(selectedSample.sample_values[i]))
    .attr("r", (d, i) => size(selectedSample.sample_values[i]))
    .style("fill", (d) => color(d))
    .attr("opacity", 0.7)
    .append("title")
    .text((d, i) => selectedSample.otu_labels[i]);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

  // Add labels
  svg
    .append("text")
    .attr("class", "x-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("OTU IDs");
}

function updateMetadata(metadata, sampleIndex) {
  const sampleMetadata = d3.select("#sample-metadata");

  // Clear previous sample metadata
  sampleMetadata.html("");

  // Display sample metadata
  const selectedMetadata = metadata[sampleIndex];
  console.log({ selectedMetadata });
  sampleMetadata.append("p").text(`id: ${selectedMetadata.id}`);
  sampleMetadata.append("p").text(`ethnicity
  : ${selectedMetadata.ethnicity}`);
  sampleMetadata.append("p").text(`gender
  : ${selectedMetadata.gender}`);
  sampleMetadata.append("p").text(`age
  : ${selectedMetadata.age}`);
  sampleMetadata.append("p").text(`location
  : ${selectedMetadata.location}`);
  sampleMetadata.append("p").text(`bbtype
  : ${selectedMetadata.bbtype}`);
  sampleMetadata.append("p").text(`wfreq
  : ${selectedMetadata.wfreq}`);
}

function initApp() {
  loadJsonData()
    .then((data) => {
      console.log({ data });
      createCharts(data);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}

initApp();
