<?xml version="1.0" encoding="windows-1250"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:strip-space elements="*"/>
<xsl:template match="ROOT">
<HTML>
<HEAD>
   <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=windows-1250"></META>
   <META NAME="Author" CONTENT="Comarch S.A."></META>
   <LINK rel="stylesheet" type="text/css" href="Style/doc.css"></LINK>
   <TITLE>Indeks tabel</TITLE>
</HEAD>
<BODY>
  <A name="index" />
  <P><xsl:apply-templates select="letterlist" /></P>
  <xsl:apply-templates select="tablelist" />
</BODY>
</HTML>

</xsl:template>

<xsl:template match="tableletter" name="tableletter">
  <DIV CLASS="TDLitera"><A name="{./@name}" ><xsl:value-of select="./@name" /></A></DIV>
  <DIV CLASS="Main">
  <xsl:apply-templates select="table" />
  </DIV>
  <DIV align="right">
  <a href="#index">na górę</a>
  </DIV>
</xsl:template>

<xsl:template match="table" >
  <A href="{@name}.html" target="main"><xsl:value-of select="@name" /><xsl:text disable-output-escaping="yes">&amp;nbsp;</xsl:text>(<xsl:value-of select="@prefix" />)</A><BR/>
</xsl:template>

<xsl:template match="letter" name="letter">
  <A href="#{.}"><xsl:value-of select="." /></A>
</xsl:template>

</xsl:stylesheet>
