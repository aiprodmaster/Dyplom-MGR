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
<P><DIV align="center"><H1>Typy dokumentów</H1></DIV></P>
<DIV CLASS="Tab">
    <TABLE border="1" class="TableInfo">
     <TR>
       <TD><B>Nazwa</B></TD>
       <TD><B>Binarnie</B></TD>
       <TD><B>Dziesiętnie</B></TD>
       <TD><B>Symbol</B></TD>
       <TD><B>Opis</B></TD>
     </TR>
  <xsl:apply-templates select="*">
    <xsl:sort select="./@name"/>
  </xsl:apply-templates>
    </TABLE>
  </DIV>
</BODY>
</HTML>

</xsl:template>

<xsl:template match="*" name="typ">
  <DIV CLASS="TextInfo">
     <TR>
       <TD><xsl:value-of select="./@name" /></TD>
       <TD><xsl:value-of select="./@binary" /></TD>
       <TD><xsl:value-of select="./@decimal" /></TD>
       <TD><xsl:value-of select="./@symbol" /></TD>
       <TD><xsl:value-of select="./@description" /></TD>
     </TR>
  </DIV>
</xsl:template>

</xsl:stylesheet>
