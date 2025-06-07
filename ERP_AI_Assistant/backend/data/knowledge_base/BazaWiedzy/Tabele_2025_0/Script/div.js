var mode = "clarion";
var activediv = "columns";

function initpage()
{
  divclarion();
  divcolumns();
}


function divclarion()
{
  document.all.sqlcolumns.style.display = "none";
  document.all.sqlindexes.style.display = "none";
  document.all.sqlrelations.style.display = "none";
  document.all.psqlcolumns.style.display = "none";
  document.all.psqlindexes.style.display = "none";
  document.all.psqlrelations.style.display = "none";
  document.all.Clarion.className = "TabActive";
  document.all.SQL.className = "TabNoActive";
  document.all.PSQL.className = "TabNoActive";
  if(activediv=="columns")
    document.all.clarioncolumns.style.display = "";
  else if(activediv=="indexes")
    document.all.clarionindexes.style.display = "";
  else
    document.all.clarionrelations.style.display = "";
  mode = "clarion";
}

function divsql()
{
  document.all.clarioncolumns.style.display = "none";
  document.all.clarionindexes.style.display = "none";
  document.all.clarionrelations.style.display = "none";
  document.all.Clarion.className = "TabNoActive";
  document.all.psqlcolumns.style.display = "none";
  document.all.psqlindexes.style.display = "none";
  document.all.psqlrelations.style.display = "none";
  document.all.SQL.className = "TabActive";
  document.all.PSQL.className = "TabNoActive";
  if(activediv=="columns")
    document.all.sqlcolumns.style.display = "";
  else if(activediv=="indexes")
    document.all.sqlindexes.style.display = "";
  else
    document.all.sqlrelations.style.display = "";
  mode = "sql";
}
function divpsql()
{
  document.all.clarioncolumns.style.display = "none";
  document.all.clarionindexes.style.display = "none";
  document.all.clarionrelations.style.display = "none";
  document.all.sqlcolumns.style.display = "none";
  document.all.sqlindexes.style.display = "none";
  document.all.sqlrelations.style.display = "none";
  document.all.Clarion.className = "TabNoActive";
  document.all.PSQL.className = "TabActive";
  document.all.SQL.className = "TabNoActive";
  if(activediv=="columns")
    document.all.psqlcolumns.style.display = "";
  else if(activediv=="indexes")
    document.all.psqlindexes.style.display = "";
  else
    document.all.psqlrelations.style.display = "";
  mode = "psql";
}

function divcolumns()
{
  document.all.clarionindexes.style.display = "none";
  document.all.clarionrelations.style.display = "none";
  document.all.sqlindexes.style.display = "none";
  document.all.sqlrelations.style.display = "none";
  document.all.psqlindexes.style.display = "none";
  document.all.psqlrelations.style.display = "none";
  document.all.Columns.className = "TabActive";
  document.all.Indexes.className = "TabNoActive";
  document.all.Relations.className = "TabNoActive";
  if(mode=="clarion")
    document.all.clarioncolumns.style.display = "";
  else if(mode=="psql")
	  document.all.psqlcolumns.style.display = "";
  else
    document.all.sqlcolumns.style.display = "";
  activediv = "columns";
}

function divindexes()
{
  document.all.clarioncolumns.style.display = "none";
  document.all.sqlcolumns.style.display = "none";
  document.all.clarionrelations.style.display = "none";
  document.all.sqlrelations.style.display = "none";
  document.all.psqlcolumns.style.display = "none";
  document.all.psqlrelations.style.display = "none";  
  document.all.Columns.className = "TabNoActive";
  document.all.Indexes.className = "TabActive";
  document.all.Relations.className = "TabNoActive";
  if(mode=="clarion")
    document.all.clarionindexes.style.display = "";
  else if(mode=="psql")
	  document.all.psqlindexes.style.display = "";
  else
    document.all.sqlindexes.style.display = "";
  activediv = "indexes";
}

function divrelations()
{
  document.all.clarionindexes.style.display = "none";
  document.all.sqlindexes.style.display = "none";
  document.all.clarioncolumns.style.display = "none";
  document.all.sqlcolumns.style.display = "none";
  document.all.psqlindexes.style.display = "none";
  document.all.psqlcolumns.style.display = "none";
  document.all.Columns.className = "TabNoActive";
  document.all.Indexes.className = "TabNoActive";
  document.all.Relations.className = "TabActive";
  if(mode=="clarion")
    document.all.clarionrelations.style.display = "";
  else if(mode=="psql")
	  document.all.psqlrelations.style.display = "";
  else
    document.all.sqlrelations.style.display = "";
  activediv = "relations";
}

