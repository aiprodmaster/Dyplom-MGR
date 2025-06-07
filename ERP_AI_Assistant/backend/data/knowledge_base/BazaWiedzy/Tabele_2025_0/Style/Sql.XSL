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
  <xsl:apply-templates />
</BODY>
</HTML>

</xsl:template>

<xsl:template match="*" name="tabledef">
  <DIV CLASS="TextInfo">
    <P>
      <A name="{./@name}" />
        <PRE>
          <xsl:choose>
            <xsl:when test="./@hidden='True'">
              <FONT SIZE="2" DISABLED="True">
              <I>/* <xsl:value-of select="./@name" /> */</I><BR/>
              <xsl:value-of select="." />
              </FONT>
            </xsl:when>
            <xsl:otherwise> 
              <FONT SIZE="2">
              <I>/* <xsl:value-of select="./@name" /> */</I><BR/>
              <xsl:value-of select="." />
              </FONT>
            </xsl:otherwise> 
          </xsl:choose>
        </PRE>
      </P>
    <HR/>
  </DIV>
</xsl:template>

<xsl:template match="br" name="br">
  <xsl:text xml:space="preserve"/>
  <xsl:text/>
    <xsl:value-of select="." /><br/>
  <xsl:text/>
</xsl:template>

</xsl:stylesheet>
