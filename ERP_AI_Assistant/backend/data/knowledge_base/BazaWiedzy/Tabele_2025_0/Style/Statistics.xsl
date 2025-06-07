<?xml version="1.0" encoding="windows-1250"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="ROOT">
<HTML>
<HEAD>
   <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=windows-1250"></META>
   <META NAME="Author" CONTENT="Comarch S.A."></META>
   <LINK rel="stylesheet" type="text/css" href="Style/doc.css"></LINK>
   <title>Statystyki tabel</title>
</HEAD>
<BODY>
  <xsl:apply-templates />
</BODY>
</HTML>
</xsl:template>

<xsl:template match="meta" name="meta">
  <DIV align="center">
  <H1>Statystyki <xsl:value-of select="./product" /></H1>
  <P>wygenerowane: <B><xsl:value-of select="./generated/date" /><xsl:text xml:space="preserve"> </xsl:text><xsl:value-of select="./generated/time" /></B>
  ze słownika: <B><xsl:value-of select="./dictionary" /></B></P>
  </DIV>
</xsl:template>

<xsl:template match="statistic" name="statistic">
<DIV align="center" CLASS="TabInner">

<TABLE border="1" width="90%" CLASS="TableInfo">
  <TR>
    <TD width="40%"> </TD>
    <TD width="30%"><B>Clarion</B></TD>
    <TD width="30%"><B>SQL</B></TD>
  </TR>
  <TR>
    <TD width="40%"><B>Tabele</B></TD>
    <TD width="30%" align="right"><xsl:value-of select="./tables.total" /></TD>
    <TD width="30%" align="right"><xsl:value-of select="./tables" /></TD>
  </TR>
  <TR>
    <TD width="40%"><B>Kolumny</B></TD>
    <TD width="30%" align="right"><xsl:value-of select="./columns.total" /></TD>
    <TD width="30%" align="right"><xsl:value-of select="./columns" /></TD>
  </TR>
  <TR>
    <TD width="40%"><B>Indeksy</B></TD>
    <TD width="30%" align="right"><xsl:value-of select="./indexes.total" /></TD>
    <TD width="30%" align="right"><xsl:value-of select="./indexes" /></TD>
  </TR>
  <TR>
    <TD width="40%"><B>Relacje</B></TD>
    <TD width="30%" align="right"><xsl:value-of select="./relations.total" /></TD>
    <TD width="30%" align="right"><xsl:value-of select="./relations" /></TD>
  </TR>
</TABLE>
</DIV>
</xsl:template>

</xsl:stylesheet>
