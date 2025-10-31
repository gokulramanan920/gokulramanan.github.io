// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
   
    let
    width = 600,
    height = 400;
   
    let margin = {
      top:50,
      bottom:50,
      left:50,
      right:50
    }

    // Create the SVG container
   
    let svg = d3.select("#boxplot")
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'lightblue')

   

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all three age groups or use
    // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group
   

    // Add scales  
    const xScale = d3.scaleBand()
    .domain([...new Set(data.map(d => d.AgeGroup))])
    .range([margin.left, width - margin.right])
    .padding(0.3);  

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Likes)])
    .range([height - margin.bottom, margin.top]);

    svg.append("g")
    .call(d3.axisBottom(xScale))
    .attr("transform", `translate(0, ${height - margin.bottom})`);

    svg.append("g")
      .call(d3.axisLeft(yScale))
      .attr("transform", `translate(${margin.left},0)`);



    // Add x-axis label
    svg.append('text')
    .attr('x', width/2)
    .attr('y', height - 15)
    .text('Age Group')
    .style('text-anchor', 'middle')
 
 
    // Add y-axis label
    svg.append('text')
      .attr('x', 0 - height/2)
      .attr('y', 15)
      .text('# Of Likes')
      .style('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')


    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return { min, q1, median, q3, max };
    };

    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup); // gets the x coordinate for each age group's boxplot
        const boxWidth = xScale.bandwidth(); // gets the width of the box for each age group
        const g = svg.append("g").attr("transform", `translate(${x},0)`);
        const center = boxWidth / 2;
       
        // Draw vertical lines
        g.append("line")
          .attr("x1", center).attr("x2", center)
          .attr("y1", yScale(quantiles.min)).attr("y2", yScale(quantiles.max))
          .attr("stroke", "black");

          // Draw box
        g.append("rect")
          .attr("x", center - 30)
          .attr("width", 60)
          .attr("y", yScale(quantiles.q3))
          .attr("height", Math.max(1, yScale(quantiles.q1) - yScale(quantiles.q3)))
          .attr("fill", "blue")
          .attr("stroke", "black");

          // Draw median line
        g.append("line")
          .attr("x1", center - 30).attr("x2", center + 30)
          .attr("y1", yScale(quantiles.median)).attr("y2", yScale(quantiles.median))
          .attr("stroke", "black").attr("stroke-width", 2);      
    });
});

// Prepare you data and load the data again.
// This data should contains three columns, platform, post type and average number of likes.
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
  // Convert string values to numbers
  data.forEach(d => d.AvgLikes = +d.AvgLikes);

  // Define the dimensions and margins for the SVG
  const width = 600, height = 400;
  const margin = { top:50, right:50, bottom:50, left:50 };

  // Create the SVG container
  const svg = d3.select("#barplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "lightblue");

  const platforms = [...new Set(data.map(d => d.Platform))];
  const post_type = [...new Set(data.map(d => d.PostType))];

  // Define four scales
  // Scale x0 is for the platform, which divide the whole scale into 4 parts
  // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
  // Recommend to add more spaces for the y scale for the legend
  // Also need a color scale for the post type
  const x0 = d3.scaleBand()
    .domain(platforms)
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const x1 = d3.scaleBand()
    .domain(post_type)
    .range([0, x0.bandwidth()])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes)])
    .range([height - margin.bottom, margin.top]);

  const color = d3.scaleOrdinal()
    .domain(post_type)
    .range(["red", "orange", "blue"]);

  // Add scales x0 and y    
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x0));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg.append("text")
    .attr("x", width/2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Platform");

  // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .text("Average Likes");

  // Group container for bars
  const barGroups = svg.selectAll("bar")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
  barGroups.append("rect")
  .attr("x", d => x1(d.PostType))
  .attr("y", d => y(d.AvgLikes))
  .attr("width", x1.bandwidth())
  .attr("height", d => (height - margin.bottom) - y(d.AvgLikes))
  .attr("fill", d => color(d.PostType));

  // Add the legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - 75}, ${margin.top})`);

  const types = [...new Set(data.map(d => d.PostType))];

  types.forEach((type, i) => {
   
    // Alread have the text information for the legend.
    // Now add a small square/rect bar next to the text with different color.
    legend.append("text")
      .attr("x", 20)
      .attr("y", i * 22 + 11)
      .attr("alignment-baseline", "middle")
      .text(type);

      legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 22)
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", color(type));

  });
});

// Prepare you data and load the data again.
// This data should contains two columns, date (3/1-3/7) and average number of likes.

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {

  // Convert string values to numbers
  data.forEach(d => {
    d.AvgLikes = +d.AvgLikes;
  });

  // Define the dimensions and margins for the SVG
  let
    width = 600,
    height = 400;

    let margin = {
    top:50,
    bottom:50,
    left:50,
    right:50
    }


  // Create the SVG container
  const svg = d3.select("#lineplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "lightblue");

  // Set up scales for x and y axes
  const x = d3.scaleBand()
    .domain(data.map(d => d.Date))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes)])
    .range([height - margin.bottom, margin.top]);

  // Draw the axis, you can rotate the text in the x-axis here
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Date");

  // Add y-axis label
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Average Likes");

  // Draw the line and path. Remember to use curveNatural.
  const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.AvgLikes))
    .curve(d3.curveNatural);

  svg.append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 2);


  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    svg.append("circle")
      .attr("cx", x(d.Date))
      .attr("cy", y(d.AvgLikes))
      .attr("r", 5)
      .attr("fill", "black");
  }

});