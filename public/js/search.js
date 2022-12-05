const handleSearchInput = async (e) => {
  const { data } = await axios.post("/search", {
    searchTerm: $("#search-input").val(),
  });
  $("#search-results").empty();
  for (let c of data) {
    const $li = $(
      `<li class="list-group-item"><a href="/${c.id}">${c.firstName} ${c.lastName}</a></li>`
    );
    $li.appendTo($("#search-results"));
  }
};
$("#search-input").on("input", handleSearchInput);
