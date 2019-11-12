<script>
  export let width = 10;
  export let height = 10;
  export let fillColor;
  export let label;
  let style = `background-color: ${fillColor}; width: ${width}px; height: ${height}px; text-align: center;`;
</script>

<div {style} >{label}</div>
