<?xml version="1.0" encoding="windows-1250"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:preserve-space elements="*"/>
<xsl:template match="ROOT">
<HTML>
<HEAD>
   <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=windows-1250"></META>
   <META NAME="Author" CONTENT="Comarch S.A."></META>
   <LINK rel="stylesheet" type="text/css" href="Style/doc.css"></LINK>
   <TITLE>Skrypt SQL</TITLE>
</HEAD>
<BODY>
  <xsl:apply-templates select="*">
    <xsl:sort select="./@idx"/>
  </xsl:apply-templates>
</BODY>
</HTML>

</xsl:template>

<xsl:template match="*" name="tabledef">
  <DIV CLASS="TextInfo">
    <xsl:choose>
      <xsl:when test="./@hidden='True'">
        <A href="{./@link}" target="main" disabled="True"><xsl:value-of select="./@name" /></A>
      </xsl:when>
      <xsl:otherwise>
        <A href="{./@link}" target="main"><xsl:value-of select="./@name" /></A>
      </xsl:otherwise>
    </xsl:choose>
    <BR/>
  </DIV>
</xsl:template>

<xsl:template match="br" name="br">
  <xsl:text xml:space="preserve"/>
  <xsl:text/>
    <xsl:value-of select="." /><br/>
  <xsl:text/>
</xsl:template>

</xsl:stylesheet>
